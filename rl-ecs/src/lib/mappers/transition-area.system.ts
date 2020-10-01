import { EntityManager } from 'rad-ecs';
import { AreaTransition } from '../components/area-transition.model';
import { Description } from '../components/description.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ActiveEffectDescription,
  TransitionToArea,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect;
export type TransitionAreaArgs = Args;

type Out = Partial<TransitionToArea> & ActiveEffectDescription;
export type TransitionAreaOut = Out;

function transitionAreaStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const areaTransition = em.getComponent(msg.effectId, AreaTransition);
  if (areaTransition) {
    console.log(`Adding area transition to: ${areaTransition.areaId}`);
    const activeEffectDescription = em.hasComponent(msg.effectId, Description)
      ? em.getComponent(msg.effectId, Description).short
      : 'undescribed effect';
    return {
      ...radClone(msg),
      areaTransition: { ...radClone(areaTransition) },
      activeEffectDescription,
    };
  } else {
    return { ...radClone(msg), activeEffectDescription: null };
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = transitionAreaStep;

export const transitionArea = typeCheck as typeof transitionAreaStep;
