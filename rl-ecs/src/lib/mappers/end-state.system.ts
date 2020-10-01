import { GameEnded } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { EndType } from '../components/end-state.model';
import { OperationStep } from '../operation-step.model';

type Args = Partial<GameEnded>;
export type EndStateArgs = Args;

interface Out {}
export type EndStateOut = Out;

function endStateStep<T extends Args>(
  msg: T,
  em: EntityManager,
  ender: (et: EndType) => void
): T & Out {
  if (msg.endType !== null && msg.endType !== undefined) {
    ender(msg.endType);
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = endStateStep;

export const endState = typeCheck as typeof endStateStep;
