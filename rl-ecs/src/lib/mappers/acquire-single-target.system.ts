import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { GridPosData } from '../components/position.model';
import { ActiveEffect } from '../systems.types';
import { SingleTarget } from '../components/single-target.model';
import { isValidId } from '@rad/rl-utils';

type Args = {
  selectedPos: GridPosData | null;
  acquiredPositions?: GridPosData[] | null;
} & ActiveEffect;

export type AcquireSingleTargetArgs = Args;

interface Out {
  acquiredPositions: GridPosData[] | null;
}
export type AcquireSingleTargetOut = Out;

function acquireSingleTargetStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  let acquiredPositions: GridPosData[] = msg.acquiredPositions || null;
  if (
    isValidId(msg.effectId) &&
    msg.selectedPos &&
    em.hasComponent(msg.effectId, SingleTarget)
  ) {
    acquiredPositions = acquiredPositions
      ? [...acquiredPositions, msg.selectedPos]
      : [msg.selectedPos];
  }

  return { ...radClone(msg), acquiredPositions };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireSingleTargetStep;

export const acquireSingleTarget = typeCheck as typeof acquireSingleTargetStep;
