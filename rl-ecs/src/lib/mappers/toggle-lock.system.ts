import { EntityManager } from 'rad-ecs';
import { Description } from '../components/description.model';
import { ToggleLock } from '../components/toggle-lock.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ChangeReport,
  EffectReport,
  LockChange,
  LockChangeDetails,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & Partial<EffectReport>;
export type ToggleLockArgs = Args;

type Out = LockChange & EffectReport;
export type ToggleLockOut = Out;

function toggleLockStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  let effectReport: ChangeReport = msg.effectReport || null;
  let lockChange: LockChangeDetails = null;
  if (em.hasComponent(msg.effectId, ToggleLock)) {
    const t = em.getComponent(msg.effectId, ToggleLock);
    console.log(`TOGGLE-LOCK: ${t.lockId}`);
    const activeEffectDescription = em.hasComponent(msg.effectId, Description)
      ? em.getComponent(msg.effectId, Description).short
      : 'Some effect';
    lockChange = { lockId: t.lockId };
    effectReport = {
      lock: {
        activeEffectDescription,
      },
    };
  }

  return { ...radClone(msg), lockChange, effectReport };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = toggleLockStep;

export const toggleLock = typeCheck as typeof toggleLockStep;
