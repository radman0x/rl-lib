import { OperationStep } from 'src/lib/operation-step.model';
import { EntityManager, EntityId } from 'rad-ecs';
import { ProtagonistEntity, TargetEntity, Collected } from './systems.types';
import { GridPos } from '../components/position.model';
import { Inventory } from '../components/inventory.model';
import { Observable, Subject } from 'rxjs';
import { filter, tap, map } from 'rxjs/operators';
import { LoggerService } from 'src/app/logger.service';

type Args = ProtagonistEntity & TargetEntity;
export type AddToInventoryArgs = Args;

type Out = Collected;
export type AddToInventoryOut = Out;

function addToInventoryStep<T extends Args>(
  msg: T,
  em: EntityManager,
  logService: LoggerService
): T & Out {
  em.removeComponent(msg.targetId, GridPos);
  const currInventory = em.get(msg.protagId).component(Inventory).contents;
  console.log(`Adding ${msg.targetId} to inventory of: ${msg.protagId}`);
  em.setComponent(
    msg.protagId,
    new Inventory({ contents: [...currInventory, msg.targetId] })
  );
  logService.log(`Item: ${msg.targetId} collected by player`);
  return { ...msg, collectedId: msg.targetId };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = addToInventoryStep;

export const addToInventory = typeCheck as typeof addToInventoryStep;

export function hookAddToInventory<T extends AddToInventoryArgs>(
  source: Observable<T>,
  dest: Subject<AddToInventoryOut & T>,
  em: EntityManager,
  logService: LoggerService
) {
  source
    .pipe(
      filter(msg => em.hasComponent(msg.protagId, Inventory)),
      map(msg => addToInventoryStep(msg, em, logService))
    )
    .subscribe(dest);
}
