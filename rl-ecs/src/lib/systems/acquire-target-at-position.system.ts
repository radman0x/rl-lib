import { Entity, EntityManager } from 'rad-ecs';
import { OperationStepMulti } from 'src/lib/operation-step.model';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';

interface Args {
  targetPos: GridPos;
}
export type AcquireTargetAtPositionArgs = Args;

interface Out {
  targetId: EntityId;
}
export type AcquireTargetAtPositionOut = Out;

type TargetPredicate = (entity: Entity) => boolean;

function acquireTargetAtPositionStep<T extends Args>(
  msg: T,
  em: EntityManager,
  predicate: TargetPredicate
): (T & Out)[] {
  const targetIds: EntityId[] = [];
  for (const candidate of em.matchingIndex(msg.targetPos)) {
    if (predicate(candidate)) {
      targetIds.push(candidate.id);
    }
  }

  return targetIds.map(id => ({ ...msg, targetId: id }));
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = acquireTargetAtPositionStep; // need this to get compile time checks for the implementation of the step

export const acquireTargetAtPosition = typeCheck as typeof acquireTargetAtPositionStep;
