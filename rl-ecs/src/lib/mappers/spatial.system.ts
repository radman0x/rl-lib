import { EntityManager } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { NewPosition, TargetEntity, MovingEntity } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = MovingEntity & NewPosition;
export type SpatialArgs = Args;

interface Out {}
export type SpatialOut = Out;

function spatialStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  if (msg.newPosition) {
    console.log(
      `SPATIAL: position of target: ${msg.movingId} updated to ${msg.newPosition}`
    );
    em.setComponent(msg.movingId, new GridPos(msg.newPosition));
  }
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = spatialStep;

export const spatial = typeCheck as typeof spatialStep;
