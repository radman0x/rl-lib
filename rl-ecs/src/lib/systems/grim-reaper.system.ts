import { EntityManager, EntityId } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { TargetEntity, ReapedEntity } from '../systems.types';
import { Wounds } from '../components/wounds.model';
import { radClone } from '../systems.utils';

type Args = TargetEntity;
export type GrimReaperArgs = Args;

type Out = Partial<ReapedEntity>;
export type GrimReaperOut = Out;

function grimReaperStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  console.log(`reaping`);
  if (!em.hasComponent(msg.targetId, Wounds)) {
    return { ...radClone(msg) };
  }
  const targetIntegrity = em.get(msg.targetId).component(Wounds);
  console.log(`Durability remaining: ${targetIntegrity.current})`);
  if (targetIntegrity.current <= 0) {
    console.log(
      `Entity ${msg.targetId} reduced to < 0 durability (${targetIntegrity.current}) and will now be removed`
    );
    const reapedEntity = em.get(msg.targetId);
    em.remove(msg.targetId);
    return { ...radClone(msg), reapedEntity };
  }
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = grimReaperStep;

export const grimReaper = typeCheck as typeof grimReaperStep;
