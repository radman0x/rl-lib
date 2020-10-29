import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { RemoveSelf } from '../components/remove-self.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ChangeReport,
  EffectReport,
  EntityRemoval,
  EntityRemovalDetails,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & Partial<EffectReport>;
export type FlagRemoveEntityArgs = Args;

type Out = EntityRemoval & EffectReport;
export type FlagRemoveEntityOut = Out;

function flagRemoveEntityStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  let effectReport: ChangeReport = msg.effectReport || null;
  let entityRemoval: EntityRemovalDetails = null;
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, RemoveSelf)) {
    effectReport = {
      removeSelf: {
        activeEffectDescription: null,
      },
    };
    entityRemoval = {
      doRemove: true,
      removeId: msg.effectId,
    };
  }
  return {
    ...radClone(msg),
    entityRemoval,
    effectReport,
  };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = flagRemoveEntityStep;

export const flagRemoveEntity = typeCheck as typeof flagRemoveEntityStep;
