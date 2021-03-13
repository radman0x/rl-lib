import { MemberOf } from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { Inventory } from '../components/inventory.model';
import { GridPos } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import { Collected } from '../systems.types';

type Args = { collectorId: EntityId; collectibleId: EntityId };
export type AddToInventoryArgs = Args;

type Out = Collected;
export type AddToInventoryOut = Out;

function addToInventoryStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  em.removeComponent(msg.collectibleId, GridPos);
  const currContents = em.get(msg.collectorId).component(Inventory).contents;
  console.log(
    `Adding ${msg.collectibleId} to inventory of: ${msg.collectorId}`
  );
  em.setComponent(
    msg.collectorId,
    new Inventory({ contents: [...currContents, msg.collectibleId] })
  );
  em.setComponent(
    msg.collectibleId,
    new MemberOf({
      id: msg.collectorId,
      component: Inventory,
      property: 'contents',
    })
  );
  return { ...msg, collectedId: msg.collectibleId };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = addToInventoryStep;

export const addToInventory = typeCheck as typeof addToInventoryStep;
