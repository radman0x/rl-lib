import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos, GridPosData } from '../components/position.model';

import * as deepEqual from 'fast-deep-equal';
import { Blockage } from '../components/blockage.model';

interface Args {
  targetPos: GridPosData;
}
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
    `MOVE: ${msg.targetPos} ${canOccupy ? 'can' : 'CANNOT'} be occupied`
  );
  return { ...msg, canOccupy };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = canOccupyPositionStep;

export const canOccupyPosition = typeCheck as typeof canOccupyPositionStep;
