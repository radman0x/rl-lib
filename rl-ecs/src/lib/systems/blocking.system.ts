import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from './systems.utils';
import { TargetEntity } from './systems.types';
import { Blockage } from '../components/blockage.model';

type Args = TargetEntity;
export type BlockingArgs = Args;

interface Out {}
export type BlockingOut = Out;

function blockingStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  console.log(`BLOCKING: ...`);
  if (!em.exists(msg.targetId)) {
    return { ...radClone(msg) };
  }
  const b = em.getComponent(msg.targetId, Blockage);
  if (b) {
    console.log(`BLOCKING: component exists`);
    for (const trigger of b.triggers) {
      console.log(
        `BLOCKING: checking trigger: ${JSON.stringify(trigger, null, 2)}`
      );
      const x = em.getComponentByName(msg.targetId, trigger.componentName);
      if (x && x[trigger.property] === trigger.value) {
        console.log(
          `BLOCKING: trigger hit!, setting active to: ${trigger.active}`
        );
        em.setComponent(
          msg.targetId,
          new Blockage({ ...b, active: trigger.active })
        );
      }
    }
  }
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = blockingStep;

export const blocking = typeCheck as typeof blockingStep;
