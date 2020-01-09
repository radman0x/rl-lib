import { EntityManager } from 'rad-ecs';
import { Combat } from '../components/combat.model';
import { Integrity } from '../components/physical.model';
import { EntityId } from '../ecs.types';
import { OperationStep } from '../operation-step.model';

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
    const targetDurabilty = em.get(msg.combatTargetId).component(Integrity);
    const attackerDamage = em.get(msg.protagId).component(Combat).damage;
    const newDurability = targetDurabilty.current - attackerDamage;
    em.setComponent(
      msg.combatTargetId,
      new Integrity({ max: targetDurabilty.max, current: newDurability })
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
