import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { AreaOfEffect } from '../components/area-of-effect.model';
import { GridPos, GridPosData } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { ActiveEffect } from '../systems.types';
import { positionsWithinRadius3d, radClone } from '../systems.utils';

type Args = {
  selectedPos: GridPosData | null;
  acquiredPositions?: GridPosData[] | null;
} & ActiveEffect;

export type AcquireAOETargetsArgs = Args;

interface Out {
  acquiredPositions: GridPosData[] | null;
}
export type AcquireAoeTargetsOut = Out;

function acquireAoePositionsStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  let acquiredPositions: GridPosData[] = msg.acquiredPositions || null;
  if (
    isValidId(msg.effectId) &&
    msg.selectedPos &&
    em.hasComponent(msg.effectId, AreaOfEffect)
  ) {
    const aoe = em.getComponent(msg.effectId, AreaOfEffect);
    const positions = positionsWithinRadius3d(
      new GridPos(msg.selectedPos),
      aoe.radius
    );
    acquiredPositions = acquiredPositions
      ? [...acquiredPositions, ...positions]
      : positions;
  }

  return { ...radClone(msg), acquiredPositions };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireAoePositionsStep;

export const acquireAoePositions = typeCheck as typeof acquireAoePositionsStep;
