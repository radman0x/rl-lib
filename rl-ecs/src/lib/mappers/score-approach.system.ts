import { Id } from '@rad/rl-applib';
import { Knowledge } from '@rad/rl-ecs';
import { ValueMap } from 'libs/rl-utils/src/lib/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { ApproachTarget } from '../components/approach-target.model';
import { DistanceMap } from '../components/distance-map.model';
import { GridPos } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { MoveOrder } from '../systems.types';
import { radClone } from '../systems.utils';
import { ApproachInfo } from './gather-approach-info.system';

interface Args {
  score: number | null;
  move: MoveOrder | null;
  agentId: EntityId | null;
  approachInfo?: ApproachInfo;
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
  let score = msg.score ?? null;
  if (msg.approachInfo && msg.move) {
    const distance = em
      .getComponent(msg.approachInfo.approachTargetId, DistanceMap)
      ?.map.get(new GridPos(msg.move.newPosition));
    if (msg.approachInfo.canSee) {
      score = score ?? 0;
      score += distance === 0 ? 1 : 1 / distance;
    }
  }

  return { ...radClone(msg), score };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = scoreApproachStep;

export const scoreApproach = typeCheck as typeof scoreApproachStep;
