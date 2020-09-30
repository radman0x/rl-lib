import { Id } from '@rad/rl-applib';
import { EntityId, EntityManager } from 'rad-ecs';
import { Alignment } from '../components/alignment.model';
import { DistanceMap } from '../components/distance-map.model';
import { GridPos, GridPosData } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { radClone } from '../systems.utils';

interface Args {
  score: number | null;
  move: {
    newPosition: GridPosData;
    movingId: EntityId;
    distanceMaps: EntityId[];
  } | null;
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
  let score = msg.score;
  if (msg.move && msg.move.distanceMaps) {
    let scoreSubtotal = 0;
    const agentAlignment = em.getComponent(msg.move.movingId, Alignment);
    for (const id of msg.move.distanceMaps) {
      const [distanceMap, alignment] = em.getComponents(
        id,
        DistanceMap,
        Alignment
      );
      const newDistance = distanceMap.map.get(
        new GridPos(msg.move.newPosition)
      );

      if (
        agentAlignment &&
        alignment &&
        agentAlignment.type !== alignment.type
      ) {
        scoreSubtotal = Math.max(scoreSubtotal, 1000 - newDistance);
      }
    }
    score = scoreSubtotal;
  }

  return { ...radClone(msg), score };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = scoreApproachStep;

export const scoreApproach = typeCheck as typeof scoreApproachStep;
