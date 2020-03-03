import { EntityManager } from 'rad-ecs';
import { Lock } from '../components/lock.model';
import { OperationStep } from '../operation-step.model';
import { LockChange, TargetEntity } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = LockChange & TargetEntity;
export type LockQualityArgs = Args;

interface Out {}
export type LockQualityOut = Out;

function lockQualityStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  if (!msg.lockChange) {
    return msg;
  } else {
    const targetLock = em.getComponent(msg.targetId, Lock);
    const out = radClone(msg);
    if (targetLock && msg.lockChange.lockId) {
      if (targetLock.lockId !== msg.lockChange.lockId) {
        console.log(`Lock IDs aren't a match, lock resists!`);
        delete out.lockChange;
      }
    }
    return out;
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = lockQualityStep;

export const lockQuality = typeCheck as typeof lockQualityStep;
