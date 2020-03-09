import { OperationStep, OperationStepMulti } from '../operation-step.model';
import { EntityManager, ComponentConstructor, EntityId } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { ProtagonistEntity } from '../systems.types';

interface Args {
  componentTypes: ComponentConstructor[];
}
export type EntitiesWithOneOfComponentsArgs = Args;

type Out = ProtagonistEntity;
export type EntitiesWithOneOfComponentsOut = Out;

function entitiesWithOneOfComponentsStep<T extends Args>(
  msg: T,
  em: EntityManager
): (T & Out)[] {
  const matches = new Set<EntityId>();
  for (const type of msg.componentTypes) {
    em.matching(type)
      .map(e => e.id)
      .forEach(id => matches.add(id));
  }
  return Array.from(matches).map(protagId => ({ ...radClone(msg), protagId }));
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = entitiesWithOneOfComponentsStep;

export const entitiesWithOneOfComponents = typeCheck as typeof entitiesWithOneOfComponentsStep;
