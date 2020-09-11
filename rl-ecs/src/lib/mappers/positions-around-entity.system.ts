import { Id } from '@rad/rl-applib';
import { isValidId, xyPositionsAround } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { OperationStepMulti } from '../operation-step.model';
import { ActiveAgent, TargetPos } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveAgent;
export type PositionsAroundEntityArgs = Args;

type Out = TargetPos;
export type PositionsAroundEntityOut = Out;

function positionsAroundEntityStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out>[] {
  if (isValidId(msg.agentId) && em.hasComponent(msg.agentId, GridPos)) {
    const positions = xyPositionsAround(em.getComponent(msg.agentId, GridPos));
    return positions.map(pos => ({ ...radClone(msg), targetPos: pos }));
  }
  return [{ ...radClone(msg), targetPos: null }];
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = positionsAroundEntityStep;

export const positionsAroundEntity = typeCheck as typeof positionsAroundEntityStep;
