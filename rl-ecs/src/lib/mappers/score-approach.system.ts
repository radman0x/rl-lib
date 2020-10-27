import { Id } from '@rad/rl-applib';
import { EntityId, EntityManager } from 'rad-ecs';
import { ApproachTarget } from '../components/approach-target.model';
import { DistanceMap } from '../components/distance-map.model';
import { GridPos } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { MoveOrder } from '../systems.types';
import { radClone } from '../systems.utils';

interface Args {
  score: number | null;
  move: MoveOrder | null;
  agentId: EntityId | null;
}
export type ScoreApproachArgs = Args;

interface Out {
  score: number | null;
}
export type ScoreApproachOut = Out;

function scoreApproachStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  let score = msg.score === null ? 0 : msg.score;
  if (em.hasComponent(msg.agentId, ApproachTarget) && msg.move) {
    const approachTargetId = em.getComponent(msg.agentId, ApproachTarget)
      .targetId;
    const targetDistanceMap = em.getComponent(approachTargetId, DistanceMap)
      .map;
    const newDistance = targetDistanceMap.get(
      new GridPos(msg.move.newPosition)
    );

    score += newDistance === 0 ? 1 : 1 / newDistance;
  }

  return { ...radClone(msg), score };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = scoreApproachStep;

export const scoreApproach = typeCheck as typeof scoreApproachStep;
