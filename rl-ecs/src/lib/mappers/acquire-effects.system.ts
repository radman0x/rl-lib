import { EntityId, EntityManager } from 'rad-ecs';
import { Effects, EffectsData } from '../components/effects.model';
import { OperationStepMulti } from '../operation-step.model';
import { radClone } from '../systems.utils';

interface Args {
  targetId: EntityId;
}
export type AcquireEffectsArgs = Args;

interface Out {
  effectId: EntityId;
}
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
