import { EntityManager } from 'rad-ecs';
import { ToggleLock } from '../components/toggle-lock.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  LockChange,
  ActiveEffectDescription
} from '../systems.types';
import { radClone } from '../systems.utils';
import { Description } from '../components/description.model';

type Args = ActiveEffect;
export type ToggleLockArgs = Args;

type Out = Partial<LockChange> & ActiveEffectDescription;
export type ToggleLockOut = Out;

function toggleLockStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const t = em.getComponent(msg.effectId, ToggleLock);
  if (t) {
    console.log(`TOGGLE-LOCK: ${t.lockId}`);
  }

  const activeEffectDescription = em.hasComponent(msg.effectId, Description)
    ? em.getComponent(msg.effectId, Description).short
    : 'Some effect';

  return t
    ? {
        ...radClone(msg),
        lockChange: { lockId: t.lockId },
        activeEffectDescription
      }
    : { ...radClone(msg), activeEffectDescription: null };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = toggleLockStep;

export const toggleLock = typeCheck as typeof toggleLockStep;
