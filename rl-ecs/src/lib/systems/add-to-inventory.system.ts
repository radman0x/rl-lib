import { EntityManager } from 'rad-ecs';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Inventory } from '../components/inventory.model';
import { GridPos } from '../components/position.model';
import { Logger } from '../ecs.types';
import { OperationStep } from '../operation-step.model';
import { Collected, ProtagonistEntity, TargetEntity } from '../systems.types';

type Args = ProtagonistEntity & TargetEntity;
export type AddToInventoryArgs = Args;

type Out = Collected;
export type AddToInventoryOut = Out;

function addToInventoryStep<T extends Args>(
  msg: T,
  em: EntityManager,
  logger: Logger
): T & Out {
  em.removeComponent(msg.targetId, GridPos);
  const currInventory = em.get(msg.protagId).component(Inventory).contents;
  console.log(`Adding ${msg.targetId} to inventory of: ${msg.protagId}`);
  em.setComponent(
    msg.protagId,
    new Inventory({ contents: [...currInventory, msg.targetId] })
  );
  logger(`Item: ${msg.targetId} collected by player`);
  return { ...msg, collectedId: msg.targetId };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = addToInventoryStep;

export const addToInventory = typeCheck as typeof addToInventoryStep;

export function hookAddToInventory<T extends AddToInventoryArgs>(
  source: Observable<T>,
  dest: Subject<AddToInventoryOut & T>,
  em: EntityManager,
  logger: Logger
) {
  source
    .pipe(
      filter(msg => em.hasComponent(msg.protagId, Inventory)),
      map(msg => addToInventoryStep(msg, em, logger))
    )
    .subscribe(dest);
}
