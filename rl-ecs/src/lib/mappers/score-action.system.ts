import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { MoveOrder } from '../systems.types';

interface Args {
  move: MoveOrder | null;
}
export type ScoreActionArgs = Args;

interface Out {
  score: number | null;
}
export type ScoreActionOut = Out;

function scoreActionStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  let score = null;
  if (msg.move !== null) {
    score = 10;
  }

  return { ...radClone(msg), score };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = scoreActionStep;

export const scoreAction = typeCheck as typeof scoreActionStep;
