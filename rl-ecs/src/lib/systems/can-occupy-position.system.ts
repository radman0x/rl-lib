import { EntityManager } from 'rad-ecs';
import { OperationStep } from 'src/lib/operation-step.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';

import * as deepEqual from 'fast-deep-equal';

interface Args {
  targetPos: GridPos;
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
    `MOVE: Pos ${msg.targetPos.toString()} ${
      canOccupy ? `can` : `CANNOT`
    } be occupied`
  );
  return { ...msg, canOccupy };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = canOccupyPositionStep;

export const canOccupyPosition = typeCheck as typeof canOccupyPositionStep;
