import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { EndState } from '../components/end-state.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ActiveEffectDescription,
  GameEnded,
} from '../systems.types';
import { addProperty, radClone } from '../systems.utils';

type Args = ActiveEffect;
export type EndGameArgs = Args;

type Out = GameEnded & ActiveEffectDescription;
export type EndGameOut = Out;

function endGameStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  if (isValidId(msg.effectId) && em.hasComponent(msg.effectId, EndState)) {
    return {
      ...radClone(msg),
      endType: em.getComponent(msg.effectId, EndState).endType,
      activeEffectDescription: 'ending game',
    };
  }
  return { ...radClone(msg), endType: null, activeEffectDescription: null };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = endGameStep;

export const endGame = typeCheck as typeof endGameStep;
