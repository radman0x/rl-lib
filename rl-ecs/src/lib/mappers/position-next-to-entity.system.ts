import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { CompassDirection, compassDirectionToUnitVector } from '@rad/rl-utils';
import { radClone } from '../systems.utils';

interface Args {
  protagId: EntityId;
  direction: CompassDirection;
}
export type PositionNextToEntityArgs = Args;

interface Out {
  targetPos: GridPos;
}
export type PositionNextToEntityOut = Out;

function positionNextToEntityStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const directionVec = compassDirectionToUnitVector.get(msg.direction)!;
  const agentPos = em.get(msg.protagId).component(GridPos);
  const targetPos = agentPos.add(new GridPos(directionVec));
  console.log(`pos next to entity: ${targetPos}`);
  return { ...radClone(msg), targetPos };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = positionNextToEntityStep;

export const positionNextToEntity = typeCheck as typeof positionNextToEntityStep;
