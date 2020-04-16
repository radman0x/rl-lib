import { EntityManager } from 'rad-ecs';
import { Wounds } from '../components/wounds.model';
import { OperationStep } from '../operation-step.model';
import { Damaged, DamageTargetEntity } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = Damaged & DamageTargetEntity;
export type IntegrityArgs = Args;

interface Out {}
export type IntegrityOut = Out;

function integrityStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  if (!msg.damage) {
    console.log(`INTEGRITY: exiting`);
    return { ...radClone(msg) };
  }
  const targetWounds = em.getComponent(msg.damageTargetId, Wounds);
  if (targetWounds) {
    const finalWounds = targetWounds.current - msg.damage.amount;
    console.log(`Updating wounds to: ${finalWounds}`);
    em.setComponent(
      msg.damageTargetId,
      new Wounds({ max: targetWounds.max, current: finalWounds })
    );
  } else {
    console.log(
      `INTEGRITY: target ${msg.damageTargetId} has no Wounds component and can't be damaged!`
    );
  }
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = integrityStep;

export const integrity = typeCheck as typeof integrityStep;
