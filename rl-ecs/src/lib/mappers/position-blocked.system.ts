import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone, addProperty } from '../systems.utils';
import { TargetPos, IsBlocked } from '../systems.types';
import { Blockage } from '../components/blockage.model';
import { GridPos } from '../components/position.model';

import * as deepEqual from 'fast-deep-equal';
import { Id } from '@rad/rl-applib';

type Args = TargetPos;
export type PositionBlockedArgs = Args;

type Out = IsBlocked;
export type PositionBlockedOut = Out;

function positionBlockedStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
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

  // console.log(`BLOCKAGE: ${msg.targetPos} ${isBlocked ? 'BLOCKED!' : 'clear'}`);
  return addProperty(msg, 'isBlocked', isBlocked);
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = positionBlockedStep;

export const positionBlocked = typeCheck as typeof positionBlockedStep;
