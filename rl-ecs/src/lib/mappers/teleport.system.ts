import { EntityManager } from 'rad-ecs';
import { Teleport } from '../components/teleport.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  Teleported,
  ActiveEffectDescription
} from '../systems.types';
import { radClone, addProperty } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { Description } from '../components/description.model';

type Args = ActiveEffect;
export type TeleportArgs = Args;

type Out = Teleported & ActiveEffectDescription;
export type TeleportOut = Out;

function teleportStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  const t = em.getComponent(msg.effectId, Teleport);
  if (t) {
    console.log(`Actioning teleport to: ${t.target}`);
    const activeEffectDescription = em.hasComponent(msg.effectId, Description)
      ? em.getComponent(msg.effectId, Description).short
      : 'Some effect';
    return {
      ...radClone(msg),
      teleport: { targetLocation: t.target },
      activeEffectDescription
    };
  } else {
    return { ...radClone(msg), teleport: null, activeEffectDescription: null };
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = teleportStep;

export const teleport = typeCheck as typeof teleportStep;
