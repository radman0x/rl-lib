import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { GridPos, GridPosData } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { radClone } from '../systems.utils';

interface Args {
  protagId: EntityId;
}
export type AcquireEntityPositionArgs = Args;

interface Out {
  targetPos: GridPosData;
}
export type AcquireEntityPositionOut = Out;

function acquireEntityPositionStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const p = em.getComponent(msg.protagId, GridPos);
  if (!p) {
    throw Error(`Protagonist entity isn't at a position!`);
  } else {
    return { ...radClone(msg), targetPos: { ...p } };
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireEntityPositionStep;

export const acquireEntityPosition = typeCheck as typeof acquireEntityPositionStep;
