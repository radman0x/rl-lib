import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { CalculateEffectDamageOut } from './calculate-effect-damage.system';
import { DamageResisted } from '../ecs.types';

type Args = CalculateEffectDamageOut;
export type ResistEffectDamageArgs = Args;

interface Out {
  damageResisted: DamageResisted;
}
export type ResistEffectDamageOut = Out;

function resistEffectDamageStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  return { ...msg, damageResisted: { type: msg.damageSustained.type, resistedAmount: 1} };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resistEffectDamageStep;

export const resistEffectDamage = typeCheck as typeof resistEffectDamageStep;
