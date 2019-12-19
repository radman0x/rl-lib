import { EntityManager } from 'rad-ecs';
import { Durability } from '../components/physical.model';
import { EntityId } from '../ecs.types';
import { OperationStep } from '../operation-step.model';

interface Args {
  targetId: EntityId;
}
export type GrimReaperArgs = Args;

interface Out {}
export type GrimReaperOut = Out;

function grimReaperStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  console.log(`reaping`);
  if (!em.hasComponent(msg.targetId, Durability)) {
    return msg;
  }
  const targetDurability = em.get(msg.targetId).component(Durability);
  console.log(`Durability remaining: ${targetDurability.current})`);
  if (targetDurability.current <= 0) {
    console.log(
      `Entity ${msg.targetId} reduced to < 0 durability (${targetDurability.current}) and will now be removed`
    );
    em.remove(msg.targetId);
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = grimReaperStep;

export const grimReaper = typeCheck as typeof grimReaperStep;
