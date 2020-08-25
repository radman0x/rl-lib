import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import {
  TargetEntity,
  LockChange,
  EffectTarget,
  WorldStateChangeDescription
} from '../systems.types';
import { Lock, oppositeLockState, LockState } from '../components/lock.model';
import { Renderable } from '../components/renderable.model';
import { radClone } from '../systems.utils';
import { Description } from '../components/description.model';
import { isValidId } from '@rad/rl-utils';
import { Id } from '@rad/rl-applib';

type Args = Partial<EffectTarget> & Partial<LockChange>;
export type LockArgs = Args;

type Out = {
  worldStateChanged: boolean;
} & WorldStateChangeDescription;

export type LockOut = Out;

function lockStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  if (msg.lockChange && isValidId(msg.effectTargetId)) {
    console.log(JSON.stringify(msg, null, 2));
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
      const worldStateChangeDescription = `${targetDescription} ${lockStateDesc(
        newState
      )}`;
      return {
        ...radClone(msg),
        worldStateChangeDescription,
        worldStateChanged: true
      };
    }
  }
  return {
    ...radClone(msg),
    worldStateChanged: msg['worldStateChanged'] || false,
    worldStateChangeDescription: msg['worldStateChangeDescription'] || null
  };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = lockStep;

export const lock = typeCheck as typeof lockStep;
