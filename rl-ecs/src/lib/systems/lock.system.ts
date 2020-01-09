import { OperationStep } from 'src/lib/operation-step.model';
import { EntityManager } from 'rad-ecs';
import { TargetEntity, LockChange } from './systems.types';
import { Lock, oppositeLockState, LockState } from '../components/lock.model';
import { Renderable } from '../components/renderable.model';

type Args = TargetEntity & LockChange;
export type LockArgs = Args;

interface Out {}
export type LockOut = Out;

function lockStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const targetLock = em.getComponent(msg.targetId, Lock);
  if (targetLock) {
    const newState = oppositeLockState(targetLock.state);
    em.setComponent(msg.targetId, new Lock({ ...targetLock, state: newState }));
    console.log(
      `LOCK-STATE: changing: ${msg.targetId} to: ${LockState[newState]} `
    );
    const r = em.getComponent(msg.targetId, Renderable);
    const stateImage = targetLock.stateImages[newState];
    if (r && stateImage) {
      em.setComponent(
        msg.targetId,
        new Renderable({ ...r, image: stateImage })
      );
      console.log(`LOCK-STATE: updating renderable to: ${stateImage}`);
    }
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = lockStep;

export const lock = typeCheck as typeof lockStep;
