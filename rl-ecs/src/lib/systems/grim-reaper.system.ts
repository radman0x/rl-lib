import { EntityManager } from 'rad-ecs';
import { Integrity } from '../components/physical.model';
import { OperationStep } from '../operation-step.model';
import { TargetEntity } from '../systems.types';

type Args = TargetEntity;
export type GrimReaperArgs = Args;

interface Out {}
export type GrimReaperOut = Out;

function grimReaperStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  console.log(`reaping`);
  if (!em.hasComponent(msg.targetId, Integrity)) {
    return msg;
  }
  const targetIntegrity = em.get(msg.targetId).component(Integrity);
  console.log(`Durability remaining: ${targetIntegrity.current})`);
  if (targetIntegrity.current <= 0) {
    console.log(
      `Entity ${msg.targetId} reduced to < 0 durability (${targetIntegrity.current}) and will now be removed`
    );
    em.remove(msg.targetId);
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = grimReaperStep;

export const grimReaper = typeCheck as typeof grimReaperStep;
