import { EntityManager } from 'rad-ecs';
import { OperationStep } from 'src/lib/operation-step.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';

import * as deepEqual from 'fast-deep-equal';

interface Args {
  protagId: EntityId;
  targetPos: GridPos;
}
export type CanStandAtArgs = Args;

interface Out {
  canStand: boolean;
}
export type CanStandAtOut = Out;

function canStandAtPositionStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  let canStand = false;
  em.each(
    (e, y, p) => {
      if (
        deepEqual(p, { ...msg.targetPos, z: msg.targetPos.z - 1 }) &&
        y.size === Size.FILL
      ) {
        canStand = true;
      }
    },
    Physical,
    GridPos
  );

  console.log(
    `MOVE: Pos ${msg.targetPos.toString()} ${
      canStand ? `can` : `CANNOT`
    } be stood on`
  );
  return { ...msg, canStand };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = canStandAtPositionStep;

export const canStandAtPosition = typeCheck as typeof canStandAtPositionStep;
