import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { Armor } from '../components/armor.model';
import { Strength } from '../components/strength.model';
import { OperationStep } from '../operation-step.model';
import { getModifiedComponent } from '../operators/modifiered-entity-pipeline.operator';
import { ArmorSaveResult, CombatTargetEntity } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = { aggressorId: EntityId | null } & CombatTargetEntity;
export type ResolveArmorSaveArgs = Args;

type Out = ArmorSaveResult;
export type ResolveArmorSaveOut = Out;

function resolveArmorSaveStep<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Id<T & Out> {
  if (
    !isValidId(msg.combatTargetId) ||
    !isValidId(msg.aggressorId) ||
    !em.hasComponent(msg.combatTargetId, Armor)
  ) {
    return { ...radClone(msg), armorSaveSuccess: null };
  }
  const attackerStrength = getModifiedComponent(msg.aggressorId, Strength, em)
    .count;
  const targetArmor = getModifiedComponent(msg.combatTargetId, Armor, em).count;
  const BASE_SAVE = 11;
  const modifier = Math.max(attackerStrength - 3, 0);
  const finalArmor = Math.max(targetArmor - modifier, 0);
  if (finalArmor === 0) {
    return { ...radClone(msg), armorSaveSuccess: false };
  }
  const actualToSave = BASE_SAVE - finalArmor;
  const saveRoll = rand.d10();
  let armorSaveSuccess = false;

  if (saveRoll === 1) {
    armorSaveSuccess = false;
  } else {
    armorSaveSuccess = saveRoll >= actualToSave;
  }
  console.log(`Wound resolved as a ${armorSaveSuccess}`);
  return { ...radClone(msg), armorSaveSuccess };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveArmorSaveStep;

export const resolveArmorSave = typeCheck as typeof resolveArmorSaveStep;
