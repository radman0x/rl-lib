import { EntityManager } from 'rad-ecs';
import { OperationStep } from 'src/lib/operation-step.model';
import { DamageData } from '../components/damage.model';
import { EntityId } from '../ecs.types';

interface Args {
  targetId: EntityId;
  damageTarget: DamageData;
}
export type CalculateEffectDamageArgs = Args;

interface Out {
  damageSustained: DamageData;
}
export type CalculateEffectDamageOut = Out;

function calculateEffectDamageStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  return { ...msg, damageSustained: msg.damageTarget };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = calculateEffectDamageStep;

export const calculateEffectDamage = typeCheck as typeof calculateEffectDamageStep;
