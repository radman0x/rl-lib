import { Id } from '@rad/rl-applib';
import { Physical } from '@rad/rl-ecs';
import {
  asCompassDirectionVec3,
  isValidId,
  roundDirectionVec3,
  unitDirectionVec3,
} from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Description } from '../components/description.model';
import { Fixed } from '../components/fixed.model';
import { Force } from '../components/force.model';
import { GridPos } from '../components/position.model';
import { Push } from '../components/push.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  AppliedForce,
  AppliedForceDetails,
  ChangeReport,
  EffectOrigin,
  EffectReport,
  EffectTarget,
  TargetPos,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & EffectOrigin & Partial<EffectTarget> & Partial<EffectReport>;
export type PushArgs = Args;

type Out = AppliedForce & EffectReport;
export type PushOut = Out;

function pushStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let force: AppliedForceDetails = null;
  let effectReport: ChangeReport = msg.effectReport || null;
  if (
    isValidId(msg.effectId) &&
    em.hasComponent(msg.effectId, Push) &&
    isValidId(msg.effectTargetId) &&
    em.hasComponent(msg.effectTargetId, GridPos) &&
    em.hasComponent(msg.effectTargetId, Physical) &&
    !em.hasComponent(msg.effectTargetId, Fixed)
  ) {
    const activeEffectDescription = em.hasComponent(msg.effectId, Description)
      ? em.getComponent(msg.effectId, Description).short
      : 'Some effect';
    effectReport = {
      physics: {
        activeEffectDescription,
      },
    };
    const direction = asCompassDirectionVec3(
      unitDirectionVec3(msg.effectOrigin, em.getComponent(msg.effectTargetId, GridPos))
    );
    force = {
      magnitude: em.getComponent(msg.effectId, Push).strength,
      direction,
    };
  }

  return { ...radClone(msg), force, effectReport };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = pushStep;

export const push = typeCheck as typeof pushStep;
