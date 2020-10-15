import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { ActiveEffect, ActiveEffectDescription, Stun } from '../systems.types';
import { isValidId } from '@rad/rl-utils';
import { Bang } from '../components/bang.model';
import { Description } from '../components/description.model';

type Args = ActiveEffect;
export type StunArgs = Args;

type Out = Stun & ActiveEffectDescription;

export type StunOut = Out;

function stunStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let stun: Stun = { stun: null };
  let activeEffectDescription: ActiveEffectDescription = {
    activeEffectDescription: null,
  };
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, Bang)) {
    const bang = em.getComponent(msg.effectId, Bang);
    stun = { stun: { strength: bang.strength, duration: bang.duration } };
    activeEffectDescription.activeEffectDescription = em.hasComponent(
      msg.effectId,
      Description
    )
      ? em.getComponent(msg.effectId, Description).short
      : 'Some effect';
  }
  return { ...radClone(msg), ...stun, ...activeEffectDescription };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = stunStep;

export const stun = typeCheck as typeof stunStep;
