import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { ToggleLock } from '../components/toggle-lock.model';
import { ActiveEffect, LockChange } from '../systems.types';
import { radClone } from '../systems.utils';
import { LockState } from '../components/lock.model';

type Args = ActiveEffect;
export type ToggleLockArgs = Args;

type Out = LockChange;
export type ToggleLockOut = Out;

function toggleLockStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const t = em.getComponent(msg.effectId, ToggleLock);
  if (t) {
    console.log(`TOGGLE-LOCK: ${t.lockId}`);
  }

  return t ? { ...radClone(msg), lockChange: { lockId: t.lockId } } : msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = toggleLockStep;

export const toggleLock = typeCheck as typeof toggleLockStep;
