import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { RandomMove } from '../components/random-move.model';
import { OperationStep } from '../operation-step.model';
import { MoveOrder } from '../systems.types';
import { radClone } from '../systems.utils';

interface Args {
  score: number | null;
  move: MoveOrder | null;
  agentId: EntityId | null;
}
export type ScoreRandomMoveArgs = Args;

interface Out {
  score: number | null;
}
export type ScoreRandomMoveOut = Out;

function scoreRandomMoveStep<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Id<T & Out> {
  let score = msg.score ?? null;
  if (
    msg.move &&
    isValidId(msg.agentId) &&
    em.hasComponent(msg.agentId, RandomMove)
  ) {
    const randomMove = em.getComponent(msg.agentId, RandomMove);

    if (rand.floating({ min: 0, max: 1 }) <= randomMove.chance) {
      score = score ?? 0;
      score += randomMove.scoreAdjust;
    }
  }
  return { ...radClone(msg), score };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = scoreRandomMoveStep;

export const scoreRandomMove = typeCheck as typeof scoreRandomMoveStep;
