import { EntityManager } from 'rad-ecs';
import { Teleport } from '../components/teleport.model';
import { OperationStep } from '../operation-step.model';
import { ActiveEffect, Teleported } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect;
export type TeleportArgs = Args;

type Out = Teleported;
export type TeleportOut = Out;

function teleportStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const t = em.getComponent(msg.effectId, Teleport);
  console.log(`Actioning teleport to: ${t.target}`);
  return t === undefined
    ? { ...radClone(msg) }
    : { ...radClone(msg), teleport: { targetLocation: t.target } };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = teleportStep;

export const teleport = typeCheck as typeof teleportStep;
