import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { MemberOf } from '../components/member-of.model';
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
    if (em.hasComponent(msg.removeId, MemberOf)) {
      const memberOf = em.getComponent(msg.removeId, MemberOf);
      const parentComponent = em.getComponent(memberOf.id, memberOf.component);
      const arr: any[] = parentComponent[memberOf.property];
      const removeIndex = arr.findIndex((e) => e === msg.removeId);
      parentComponent[memberOf.property].splice(removeIndex, 1);
      em.setComponent(memberOf.id, parentComponent);
    }
    em.remove(msg.removeId);
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = removeEntityStep;

export const removeEntity = typeCheck as typeof removeEntityStep;
