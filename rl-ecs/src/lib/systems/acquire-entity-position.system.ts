import { EntityManager } from 'rad-ecs';
import { OperationStep } from 'src/lib/operation-step.model';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';

interface Args {
  protagId: EntityId;
}
export type AcquireEntityPositionArgs = Args;

interface Out {
  targetPos: GridPos;
}
export type AcquireEntityPositionOut = Out;

function acquireEntityPositionStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const protagEntity = em.get(msg.protagId);
  if (!protagEntity.has(GridPos)) {
    throw Error(`Protagonist entity isn't at a position!`);
  }
  return { ...msg, targetPos: protagEntity.component(GridPos) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireEntityPositionStep;

export const acquireEntityPosition = typeCheck as typeof acquireEntityPositionStep;
