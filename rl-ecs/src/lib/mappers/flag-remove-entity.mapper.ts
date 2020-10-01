import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { RemoveSelf } from '../components/remove-self.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ActiveEffectDescription,
  EntityRemoval,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect;
export type FlagRemoveEntityArgs = Args;

type Out = EntityRemoval & ActiveEffectDescription;
export type FlagRemoveEntityOut = Out;

function flagRemoveEntityStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, RemoveSelf)) {
    return {
      ...radClone(msg),
      removeId: msg.effectId,
      doRemove: true,
      activeEffectDescription: 'removing self',
    };
  }
  return {
    ...radClone(msg),
    removeId: null,
    doRemove: null,
    activeEffectDescription: null,
  };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = flagRemoveEntityStep;

export const flagRemoveEntity = typeCheck as typeof flagRemoveEntityStep;
