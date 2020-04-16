import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { TargetPos } from '../systems.types';
import { Blockage } from '../components/blockage.model';
import { GridPos } from '../components/position.model';

import * as deepEqual from 'fast-deep-equal';

type Args = TargetPos;
export type PositionBlockedArgs = Args;

interface Out {
  isBlocked: boolean;
}
export type PositionBlockedOut = Out;

function positionBlockedStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  let isBlocked = false;
  em.each(
    (e, b, p) => {
      if (deepEqual(p, msg.targetPos) && b.active) {
        isBlocked = true;
      }
    },
    Blockage,
    GridPos
  );

  console.log(`BLOCKAGE: ${msg.targetPos} ${isBlocked ? 'BLOCKED!' : 'clear'}`);
  return { ...radClone(msg), isBlocked };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = positionBlockedStep;

export const positionBlocked = typeCheck as typeof positionBlockedStep;
