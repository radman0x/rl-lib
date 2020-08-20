import { EntityManager } from 'rad-ecs';
import { Lock } from '../components/lock.model';
import { OperationStep } from '../operation-step.model';
import { EffectTarget, LockChange } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = LockChange & EffectTarget;
export type LockQualityArgs = Args;

interface Out {}
export type LockQualityOut = Out;

function lockQualityStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  if (msg.effectTargetId === null || msg.lockChange === null) {
    return radClone(msg);
  }
  const targetLock = em.getComponent(msg.effectTargetId, Lock);
  const out = radClone(msg);
  if (targetLock && msg.lockChange.lockId) {
    if (targetLock.lockId !== msg.lockChange.lockId) {
      console.log(`Lock IDs aren't a match, lock resists!`);
      delete out.lockChange;
    }
  }
  return radClone(out);
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = lockQualityStep;

export const lockQuality = typeCheck as typeof lockQualityStep;
