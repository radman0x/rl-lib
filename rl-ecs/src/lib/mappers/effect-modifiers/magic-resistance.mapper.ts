import { Id } from '@rad/rl-applib';
import { EntityManager } from 'rad-ecs';
import { MagicResistance } from '../../components/magic-resistance.model';
import { OperationStep } from '../../operation-step.model';
import { EffectTarget, Teleported } from '../../systems.types';
import { radClone } from '../../systems.utils';

type Args = Partial<Teleported> & Partial<EffectTarget>;
export type MagicResistanceArgs = Args;

interface Out {}
export type MagicResistanceOut = Out;

function magicResistanceStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  if (msg.effectTargetId === null || msg.effectTargetId === undefined) {
    return { ...radClone(msg) };
  }
  if (em.hasComponent(msg.effectTargetId, MagicResistance)) {
    if (msg['teleport'] !== undefined) {
      msg['teleport'] = null;
    }
  }
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = magicResistanceStep;

export const magicResistance = typeCheck as typeof magicResistanceStep;
