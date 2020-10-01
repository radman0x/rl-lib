import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { EntityRemoval } from '../systems.types';

type Args = Partial<EntityRemoval>;
export type RemoveEntityArgs = Args;

interface Out {}
export type RemoveEntityOut = Out;

function removeEntityStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  if (msg.doRemove && isValidId(msg.removeId)) {
    em.remove(msg.removeId);
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = removeEntityStep;

export const removeEntity = typeCheck as typeof removeEntityStep;
