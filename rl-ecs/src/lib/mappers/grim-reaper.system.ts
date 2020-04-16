import { EntityManager } from 'rad-ecs';
import { Wounds } from '../components/wounds.model';
import { OperationStep } from '../operation-step.model';
import { DamageTargetEntity, ReapedEntity } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = DamageTargetEntity;
export type GrimReaperArgs = Args;

type Out = Partial<ReapedEntity>;
export type GrimReaperOut = Out;

function grimReaperStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  if (msg.damageTargetId === null) {
    return { ...radClone(msg) };
  }
  if (!em.hasComponent(msg.damageTargetId, Wounds)) {
    return { ...radClone(msg) };
  }
  console.log(`REAPER: More work`);
  const targetIntegrity = em.get(msg.damageTargetId).component(Wounds);
  console.log(`Durability remaining: ${targetIntegrity.current})`);
  if (targetIntegrity.current <= 0) {
    const reapedEntity = em.get(msg.damageTargetId);
    em.remove(msg.damageTargetId);
    console.log(`REAPER: Entity reaped: ${msg.damageTargetId}`);
    return { ...radClone(msg), reapedEntity };
  }
  console.log(`REAPER: Reap not required`);
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = grimReaperStep;

export const grimReaper = typeCheck as typeof grimReaperStep;
