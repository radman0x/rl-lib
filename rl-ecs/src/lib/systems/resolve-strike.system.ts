import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import {
  ProtagonistEntity,
  CombatTarget,
  StrikeResult
} from '../systems.types';
import { Martial } from '../components/martial.model';
import { d10 } from '@rad/rl-utils';

type Args = ProtagonistEntity & CombatTarget;
export type ResolveStrikeArgs = Args;

type Out = StrikeResult;
export type ResolveStrikeOut = Out;

function resolveStrikeStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const targetMartial = em.getComponent(msg.combatTargetId, Martial);
  if (targetMartial.weaponSkill === 0) {
    return { ...radClone(msg), strikeSuccess: true };
  }
  const protagMartial = em.getComponent(msg.protagId, Martial);
  const BASE_TO_HIT = 6;
  const wsDiff = protagMartial.weaponSkill - targetMartial.weaponSkill;
  const actualToHit = BASE_TO_HIT - wsDiff;
  const hitRoll = d10();
  let strikeSuccess = false;
  const AUTO_HIT = 10;
  const AUTO_MISS = 1;
  if (hitRoll === AUTO_HIT) {
    strikeSuccess = true;
  } else if (hitRoll === AUTO_MISS) {
    strikeSuccess = false;
  } else {
    strikeSuccess = hitRoll >= actualToHit;
  }
  console.log(`Strike resolved as a: ${strikeSuccess ? 'hit!' : 'miss'}`);
  return { ...radClone(msg), strikeSuccess };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveStrikeStep;

export const resolveStrike = typeCheck as typeof resolveStrikeStep;
