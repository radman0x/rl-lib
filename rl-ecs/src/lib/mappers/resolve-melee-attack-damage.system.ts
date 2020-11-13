import { Id } from '@rad/rl-applib';
import { EntityId, EntityManager } from 'rad-ecs';
import { Attacks } from '../components/attacks.model';
import { OperationStep } from '../operation-step.model';
import {
  ArmorSaveResult,
  CombatTargetEntity,
  Damaged,
  DamageTargetEntity,
  DamageType,
  StrikeResult,
  WoundResult,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = { aggressorId: EntityId } & StrikeResult &
  WoundResult &
  ArmorSaveResult &
  CombatTargetEntity;
export type ResolveMeleeAttackDamageArgs = Args;

type Out = Damaged & DamageTargetEntity;
export type ResolveMeleeAttackDamageOut = Out;

function resolveMeleeAttackDamageStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  if (!msg.woundSuccess || !msg.strikeSuccess || msg.armorSaveSuccess) {
    // console.log(`COMBAT: Wound not occurring`);
    return { ...radClone(msg), damage: null, damageTargetId: null };
  }

  const attacks = em.getComponent(msg.aggressorId, Attacks);
  let damage = { type: DamageType.PHYSICAL, amount: 0 };
  if (attacks) {
    damage.amount = attacks.damage;
    // console.log(`COMBAT: Inflicting: ${damage.amount} wounds`);
  } else {
    // console.log(`COMBAT: Inflicting no wounds, there were no attacks`);
  }
  return { ...radClone(msg), damage, damageTargetId: msg.combatTargetId };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveMeleeAttackDamageStep;

export const resolveMeleeAttackDamage = typeCheck as typeof resolveMeleeAttackDamageStep;
