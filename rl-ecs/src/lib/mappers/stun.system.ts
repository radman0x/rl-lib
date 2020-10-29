import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Bang } from '../components/bang.model';
import { Description } from '../components/description.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ChangeReport,
  EffectReport,
  Stun,
  StunDetails,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & Partial<EffectReport>;
export type StunArgs = Args;

type Out = Stun & EffectReport;

export type StunOut = Out;

function stunStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let stun: StunDetails = null;
  let effectReport: ChangeReport = msg.effectReport || null;
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, Bang)) {
    const bang = em.getComponent(msg.effectId, Bang);
    stun = { strength: bang.strength, duration: bang.duration };
    const activeEffectDescription = em.hasComponent(msg.effectId, Description)
      ? em.getComponent(msg.effectId, Description).short
      : 'Some effect';
    effectReport = {
      sensate: {
        activeEffectDescription,
      },
    };
  }
  return { ...radClone(msg), stun, effectReport };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = stunStep;

export const stun = typeCheck as typeof stunStep;
