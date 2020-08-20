import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import {
  CanOccupy,
  CanStand,
  MovingEntity,
  SpatialChange,
  TargetPos
} from '../systems.types';
import { addProperty } from '../systems.utils';

type Args = MovingEntity & CanStand & CanOccupy & TargetPos;
export type ResolveMoveArgs = Args;

type Out = SpatialChange;
export type ResolveMoveOut = Out;

function resolveMoveStep<T extends Args>(msg: T): T & Out {
  if (msg.movingId === null || msg.targetPos === null) {
    return addProperty(msg, 'spatial', null);
  }
  let newPos = null;
  let movingId = null;
  if (msg.canOccupy && msg.canStand) {
    newPos = msg.targetPos;
    movingId = msg.movingId;
    return addProperty(msg, 'spatial', {
      movingId: msg.movingId,
      newPos: msg.targetPos
    });
  }
  return addProperty(msg, 'spatial', null);
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveMoveStep;

export const resolveMove = typeCheck as typeof resolveMoveStep;
