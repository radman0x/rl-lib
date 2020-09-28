import { Id } from '@rad/rl-applib';
import { OperationStep } from '../operation-step.model';
import {
  CanOccupy,
  CanStand,
  IsBlocked,
  MoveDetails,
  MoveOrder,
  MovingEntity,
  TargetPos
} from '../systems.types';
import { addProperty } from '../systems.utils';
import { isValidId } from '@rad/rl-utils';

type Args = MovingEntity & CanStand & CanOccupy & TargetPos & IsBlocked;
export type ResolveMoveArgs = Args;

type Out = MoveDetails;
export type ResolveMoveOut = Out;

function resolveMoveStep<T extends Args>(msg: T): Id<T & Out> {
  if (
    msg.canOccupy &&
    msg.canStand &&
    !msg.isBlocked &&
    isValidId(msg.movingId)
  ) {
    return addProperty(msg, 'newPosition', msg.targetPos);
  }
  return addProperty(msg, 'newPosition', null);
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveMoveStep;

export const resolveMove = typeCheck as typeof resolveMoveStep;
