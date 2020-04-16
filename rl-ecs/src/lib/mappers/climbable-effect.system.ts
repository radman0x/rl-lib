import { OperationStep } from '../operation-step.model';
import { EntityManager, EntityId } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Climbable, ClimbableData } from '../components/climbable.model';

interface Args {
  effectId: EntityId;
}
export type ClimbableEffectArgs = Args;

interface Out {
  climbable?: ClimbableData;
}
export type ClimbableEffectOut = Out;

function climbableEffectStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const climbable = em.getComponent(msg.effectId, Climbable);

  return climbable === undefined
    ? { ...radClone(msg) }
    : { ...radClone(msg), climbable };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = climbableEffectStep;

export const climbableEffect = typeCheck as typeof climbableEffectStep;
