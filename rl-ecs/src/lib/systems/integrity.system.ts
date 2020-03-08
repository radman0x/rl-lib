import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { DamageData } from '../components/damage.model';
import { TargetEntity } from '../systems.types';
import { Wounds } from '../components/wounds.model';

type Args = { damage: DamageData } & TargetEntity;
export type IntegrityArgs = Args;

interface Out {}
export type IntegrityOut = Out;

function integrityStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const targetWounds = em.getComponent(msg.targetId, Wounds);
  if (targetWounds) {
    const finalWounds = targetWounds.current - msg.damage.amount;
    console.log(`Updating wounds to: ${finalWounds}`);
    em.setComponent(
      msg.targetId,
      new Wounds({ max: targetWounds.max, current: finalWounds })
    );
  } else {
    console.log(
      `INTEGRITY: target ${msg.targetId} has no Wounds component and can't be damaged!`
    );
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = integrityStep;

export const integrity = typeCheck as typeof integrityStep;
