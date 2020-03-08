import { EntityManager } from 'rad-ecs';
import { Combat } from '../components/combat.model';
import { EntityId } from '../ecs.types';
import { OperationStep } from '../operation-step.model';
import { Wounds } from '../components/wounds.model';

interface Args {
  protagId: EntityId;
  combatTargetId: EntityId;
}
export type CalculateDamageArgs = Args;

interface Out {}
export type CalculateDamageOut = Out;

function calculateDamageStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  if (em.get(msg.protagId).has(Combat)) {
    const targetDurabilty = em.get(msg.combatTargetId).component(Wounds);
    const attackerDamage = em.get(msg.protagId).component(Combat).damage;
    const newDurability = targetDurabilty.current - attackerDamage;
    em.setComponent(
      msg.combatTargetId,
      new Wounds({ max: targetDurabilty.max, current: newDurability })
    );
    console.log(
      `Combat target ${msg.combatTargetId} has sustained ${attackerDamage} and has current durability ${newDurability}`
    );
  } else {
    console.log(`Entity ${msg.protagId} cannot attack!`);
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = calculateDamageStep;

export const calculateDamage = typeCheck as typeof calculateDamageStep;
