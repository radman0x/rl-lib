import { EntityManager } from 'rad-ecs';
import {
  AreaTransition,
  AreaTransitionData,
} from '../components/area-transition.model';
import { Description } from '../components/description.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ChangeReport,
  EffectReport,
  TransitionToArea,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & Partial<EffectReport>;
export type TransitionAreaArgs = Args;

type Out = TransitionToArea & EffectReport;
export type TransitionAreaOut = Out;

function transitionAreaStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  let effectReport: ChangeReport = msg.effectReport || null;
  let areaTransition: AreaTransitionData = null;
  const areaTransitionComponent = em.getComponent(msg.effectId, AreaTransition);
  if (areaTransitionComponent) {
    console.log(`Adding area transition to: ${areaTransitionComponent.areaId}`);
    const activeEffectDescription = em.hasComponent(msg.effectId, Description)
      ? em.getComponent(msg.effectId, Description).short
      : 'undescribed effect';
    areaTransition = { ...radClone(areaTransitionComponent) };
    effectReport = {
      area: {
        activeEffectDescription,
      },
    };
  }

  return { ...radClone(msg), areaTransition, effectReport };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = transitionAreaStep;

export const transitionArea = typeCheck as typeof transitionAreaStep;
