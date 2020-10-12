import * as deepEqual from 'fast-deep-equal';
import { EntityManager } from 'rad-ecs';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { TargetPos } from '../systems.types';
import { Id } from '@rad/rl-applib';
import { radClone } from '../systems.utils';

type Args = TargetPos;
export type CanOccupyPositionArgs = Args;

interface Out {
  canOccupy: boolean;
}
export type CanOccupyPositionOut = Out;

function canOccupyPositionStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  if (!msg.targetPos) {
    return { ...radClone(msg), canOccupy: null };
  }
  let canOccupy = true;
  em.matchingIndex(new GridPos(msg.targetPos)).forEach((entity) => {
    if (entity.has(Physical) && entity.component(Physical).size === Size.FILL) {
      canOccupy = false;
    }
  });

  console.log(
    `OCCUPY: ${msg.targetPos} ${canOccupy ? 'can' : 'CANNOT'} be occupied`
  );
  return { ...radClone(msg), canOccupy };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = canOccupyPositionStep;

export const canOccupyPosition = typeCheck as typeof canOccupyPositionStep;
