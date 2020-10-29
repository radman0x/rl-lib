import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { EndState, EndType } from '../components/end-state.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ChangeReport,
  EffectReport,
  GameEnded,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & Partial<EffectReport>;
export type EndGameArgs = Args;

type Out = GameEnded & EffectReport;
export type EndGameOut = Out;

function endGameStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let effectReport: ChangeReport = msg.effectReport || null;
  let endType: EndType = null;
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, EndState)) {
    endType = em.getComponent(msg.effectId, EndState).endType;
    effectReport = {
      endState: {
        activeEffectDescription: 'ending game',
      },
    };
  }
  return { ...radClone(msg), endType, effectReport };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = endGameStep;

export const endGame = typeCheck as typeof endGameStep;
