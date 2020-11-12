import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Description } from '../components/description.model';
import { Force } from '../components/force.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  AppliedForce,
  AppliedForceDetails,
  ChangeReport,
  EffectReport,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & Partial<EffectReport> & Partial<AppliedForce>;
export type ForceArgs = Args;

type Out = AppliedForce & EffectReport;
export type ForceOut = Out;

function forceStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let force: AppliedForceDetails = msg.force || null;
  let effectReport: ChangeReport = msg.effectReport || null;
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, Force)) {
    const activeEffectDescription = em.hasComponent(msg.effectId, Description)
      ? em.getComponent(msg.effectId, Description).short
      : 'Some effect';
    effectReport = {
      physics: {
        activeEffectDescription,
      },
    };
    const forceComp = em.getComponent(msg.effectId, Force);
    force = {
      magnitude: forceComp.magnitude,
      direction: forceComp.direction,
    };
  }

  return { ...radClone(msg), force, effectReport };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = forceStep;

export const force = typeCheck as typeof forceStep;
