import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { GridPosData } from '../components/position.model';
import { ActiveEffect } from '../systems.types';
import { isValidId } from '@rad/rl-utils';
import { AreaOfEffect } from '../components/area-of-effect.model';

type Args = {
  selectedPos: GridPosData;
} & ActiveEffect;

export type AcquireTargetPositionsArgs = Args;

interface Out {}
export type AcquireTargetPositionsOut = Out;

function acquireTargetPositionsStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, AreaOfEffect)) {
  }
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireTargetPositionsStep;

export const acquireTargetPositions = typeCheck as typeof acquireTargetPositionsStep;
