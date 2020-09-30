import { OperationStep } from '../operation-step.model';
import { EntityManager, EntityId } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { DistanceMaps, AttackOrder, OrderScore } from '../systems.types';
import { isValidId } from '@rad/rl-utils';
import { DamageData } from '../components/damage.model';

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
  let score = msg.score;
  if (msg.attack && msg.attack.combatTargetId) {
    score = 10000;
  }

  return { ...radClone(msg), score };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = scoreAttackStep;

export const scoreAttack = typeCheck as typeof scoreAttackStep;
