import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Description } from '../components/description.model';
import { Teleport } from '../components/teleport.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ActiveEffectDescription,
  Teleported,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect;
export type TeleportArgs = Args;

type Out = Partial<Teleported> & ActiveEffectDescription;
export type TeleportOut = Out;

function teleportStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  if (isValidId(msg.effectId)) {
    const t = em.getComponent(msg.effectId, Teleport);
    if (t) {
      console.log(`Actioning teleport to: ${JSON.stringify(t.target)}`);
      const activeEffectDescription = em.hasComponent(msg.effectId, Description)
        ? em.getComponent(msg.effectId, Description).short
        : 'Some effect';
      return {
        ...radClone(msg),
        bronson: 'somehting',
        teleport: { targetLocation: t.target },
        activeEffectDescription,
      };
    }
  }
  return { ...radClone(msg), teleport: null, activeEffectDescription: null };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = teleportStep;

export const teleport = typeCheck as typeof teleportStep;
