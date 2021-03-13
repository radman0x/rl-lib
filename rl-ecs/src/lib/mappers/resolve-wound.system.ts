import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { Strength } from '../components/strength.model';
import { Toughness } from '../components/toughness.model';
import { OperationStep } from '../operation-step.model';
import { getModifiedComponent } from '../operators/modifiered-entity-pipeline.operator';
import { CombatTargetEntity, WoundResult } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = { aggressorId: EntityId | null } & CombatTargetEntity;
export type ResolveWoundArgs = Args;

type Out = WoundResult;
export type ResolveWoundOut = Out;

function resolveWoundStep<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Id<T & Out> {
  if (!isValidId(msg.combatTargetId) || !isValidId(msg.aggressorId)) {
    return { ...radClone(msg), woundSuccess: null };
  }
  const attackerStrength = getModifiedComponent(msg.aggressorId, Strength, em)
    .count;
  const targetToughness = getModifiedComponent(
    msg.combatTargetId,
    Toughness,
    em
  ).count;
  const BASE_TO_WOUND = 6;
  const stDiff = attackerStrength - targetToughness;
  const actualToWound = BASE_TO_WOUND - stDiff;
  const woundRoll = rand.d10();
  let woundSuccess = false;
  if (woundRoll === 10) {
    woundSuccess = true;
  } else if (woundRoll === 1) {
    woundSuccess = false;
  } else {
    woundSuccess = woundRoll >= actualToWound;
  }
  // console.log(`Wound resolved as a ${woundSuccess}`);
  return { ...radClone(msg), woundSuccess };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveWoundStep;

export const resolveWound = typeCheck as typeof resolveWoundStep;
