import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { Description } from '../components/description.model';
import { Lock, LockState, oppositeLockState } from '../components/lock.model';
import { Renderable } from '../components/renderable.model';
import { OperationStep } from '../operation-step.model';
import {
  EffectReport,
  EffectTarget,
  LockChange,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = Partial<EffectReport> &
  Partial<EffectTarget> &
  Partial<LockChange> &
  Partial<WorldStateChangeReport>;
export type LockArgs = Args;

type Out = EffectReport;
export type LockOut = Out;

function lockStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let out = { ...radClone(msg) };
  if (msg.lockChange && isValidId(msg.effectTargetId)) {
    const targetLock = em.getComponent(msg.effectTargetId, Lock);
    if (targetLock) {
      const newState = oppositeLockState(targetLock.state);
      em.setComponent(
        msg.effectTargetId,
        new Lock({ ...targetLock, state: newState })
      );
      console.log(
        `LOCK-STATE: changing: ${msg.effectTargetId} to: ${LockState[newState]} `
      );
      const r = em.getComponent(msg.effectTargetId, Renderable);
      const stateImage = targetLock.stateImages[newState];
      if (r && stateImage) {
        em.setComponent(
          msg.effectTargetId,
          new Renderable({ ...r, image: stateImage })
        );
        console.log(`LOCK-STATE: updating renderable to: ${stateImage}`);
      }
      const lockStateDesc = (state: LockState) =>
        state === LockState.UNLOCKED ? 'unlocks' : 'locks';
      const targetDescription = em.hasComponent(msg.effectTargetId, Description)
        ? em.getComponent(msg.effectTargetId, Description).short
        : 'Target';
      _.set(
        out,
        'effectReport.lock.worldStateChangeDescription',
        `${targetDescription} ${lockStateDesc(newState)}`
      );
    }
  }

  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = lockStep;

export const lock = typeCheck as typeof lockStep;
