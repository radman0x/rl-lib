import { EntityId, EntityManager } from 'rad-ecs';
import { Effects, EffectsData } from '../components/effects.model';
import { OperationStepMulti } from '../operation-step.model';
import { radClone } from '../systems.utils';
import { ActiveEffect } from '../systems.types';

interface Args {
  targetId: EntityId;
}
export type AcquireEffectsArgs = Args;

type Out = ActiveEffect;
export type AcquireEffectsOut = Out;

function acquireEffectsStep<T extends Args>(
  msg: T,
  em: EntityManager
): (T & Out)[] {
  console.log(`Acquiring effects`);
  const effects = em.getComponent(msg.targetId, Effects);
  if (effects) {
    return effects.contents.map(e => ({ ...radClone(msg), effectId: e }));
  } else {
    return [];
  }
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = acquireEffectsStep;

export const acquireEffects = typeCheck as typeof acquireEffectsStep;
