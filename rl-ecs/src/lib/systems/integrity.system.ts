import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { DamageData } from '../components/damage.model';
import { Integrity } from '../components/physical.model';
import { TargetEntity } from './systems.types';

type Args = { damage: DamageData } & TargetEntity;
export type IntegrityArgs = Args;

interface Out {}
export type IntegrityOut = Out;

function integrityStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const targetIntegrity = em.getComponent(msg.targetId, Integrity);
  if (targetIntegrity) {
    const finalIntegrity = targetIntegrity.current - msg.damage.amount;
    em.setComponent(
      msg.targetId,
      new Integrity({ max: targetIntegrity.max, current: finalIntegrity })
    );
  } else {
    console.log(
      `INTEGRITY: target ${msg.targetId} has no integrity component and can't be damaged!`
    );
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = integrityStep;

export const integrity = typeCheck as typeof integrityStep;
