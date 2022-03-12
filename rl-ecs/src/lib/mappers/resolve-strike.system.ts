import { OperationStep } from '../operation-step.model';
import { EntityManager, EntityId } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { CombatTargetEntity, StrikeResult } from '../systems.types';
import { Martial } from '../components/martial.model';

import * as Chance from 'chance';
import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { WeaponSkill } from '../components/weapon-skill.model';
import { getModifiedComponent } from '../operators/modifiered-entity-pipeline.operator';
import { DefenseSkill } from '@rad/rl-ecs';

type Args = { aggressorId: EntityId | null } & CombatTargetEntity;
export type ResolveStrikeArgs = Args;

type Out = StrikeResult;
export type ResolveStrikeOut = Out;

function resolveStrikeStep<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Id<T & Out> {
  if (!isValidId(msg.combatTargetId) || !isValidId(msg.aggressorId)) {
    return { ...radClone(msg), strikeSuccess: null };
  }
  const targetDefenseSkill = getModifiedComponent(msg.combatTargetId, DefenseSkill, em)?.count;

  const targetWeaponSkill = getModifiedComponent(msg.combatTargetId, WeaponSkill, em).count;

  const defenderSkill = targetDefenseSkill ?? targetWeaponSkill;

  if (defenderSkill === 0) {
    return { ...radClone(msg), strikeSuccess: true };
  }
  const protagWeaponSkill = getModifiedComponent(msg.aggressorId, WeaponSkill, em).count;
  const BASE_TO_HIT = 6;
  const wsDiff = protagWeaponSkill - defenderSkill;
  const actualToHit = BASE_TO_HIT - wsDiff;
  const hitRoll = rand.d10();
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
  // console.log(`Strike resolved as a: ${strikeSuccess ? 'hit!' : 'miss'}`);
  return { ...radClone(msg), strikeSuccess };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveStrikeStep;

export const resolveStrike = typeCheck as typeof resolveStrikeStep;
