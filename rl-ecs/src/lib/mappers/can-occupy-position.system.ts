import * as deepEqual from 'fast-deep-equal';
import { EntityManager } from 'rad-ecs';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { TargetPos } from '../systems.types';

type Args = TargetPos;
export type CanOccupyPositionArgs = Args;

interface Out {
  canOccupy: boolean;
}
export type CanOccupyPositionOut = Out;

function canOccupyPositionStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  if (!msg.targetPos) {
    throw Error(`No target pos present so cannot determine occupyability!`);
  }
  let canOccupy = true;
  em.each(
    (e, y, p) => {
      if (deepEqual(p, msg.targetPos) && y.size === Size.FILL) {
        canOccupy = false;
      }
    },
    Physical,
    GridPos
  );

  console.log(
    `OCCUPY: ${msg.targetPos} ${canOccupy ? 'can' : 'CANNOT'} be occupied`
  );
  return { ...msg, canOccupy };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = canOccupyPositionStep;

export const canOccupyPosition = typeCheck as typeof canOccupyPositionStep;
