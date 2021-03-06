import { Id } from '@rad/rl-applib';
import { EntityId, EntityManager } from 'rad-ecs';
import { DamageData } from '../components/damage.model';
import { OperationStep } from '../operation-step.model';
import { radClone } from '../systems.utils';

interface Args {
  attack: {
    combatTargetId: EntityId;
    aggressorId: EntityId;
    strikeSuccess: boolean;
    woundSuccess: boolean;
    damage: DamageData | null;
    damageTargetId: EntityId | null;
  } | null;
  score: number | null;
}
export type ScoreAttackArgs = Args;

interface Out {
  score: number | null;
}
export type ScoreAttackOut = Out;

function scoreAttackStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  let score = msg.score ?? null;
  if (msg.attack && msg.attack.combatTargetId) {
    score = 2;
  }

  return { ...radClone(msg), score };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = scoreAttackStep;

export const scoreAttack = typeCheck as typeof scoreAttackStep;
