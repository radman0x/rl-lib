import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import {
  CanStand,
  CanOccupy,
  TargetPos,
  NewPosition,
  TargetEntity,
  ProtagonistEntity
} from '../systems.types';

type Args = ProtagonistEntity & CanStand & CanOccupy & TargetPos;
export type ResolveMoveArgs = Args;

type Out = NewPosition & TargetEntity;
export type ResolveMoveOut = Out;

function resolveMoveStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  let newPosition = null;
  let targetId = null;
  if (msg.canOccupy && msg.canStand) {
    newPosition = msg.targetPos;
    targetId = msg.protagId;
  }
  return { ...radClone(msg), newPosition, targetId };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveMoveStep;

export const resolveMove = typeCheck as typeof resolveMoveStep;
