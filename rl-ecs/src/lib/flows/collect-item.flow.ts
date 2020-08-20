import { EntityId, EntityManager } from 'rad-ecs';
import { of, Subject } from 'rxjs';
import { map, mergeMap, toArray, filter, reduce, take } from 'rxjs/operators';
import { GridPos } from '../components/position.model';
import { entitiesAtPosition } from '../mappers/entities-at-position.system';
import {
  suitableForCollection,
  SuitableForCollectionOut
} from '../mappers/suitable-for-collection.mapper';
import { TargetPos } from '../systems.types';
import { addProperty } from '../systems.utils';
import { noneOf } from '../operators/none-of.operator';
import { addToInventory } from '../actioners/add-to-inventory.actioner';

export type CollectItemFlowOut = {
  collectorId: EntityId | null;
  itemsCollected: EntityId[];
  itemsIgnored: EntityId[];
};

export function collectItemFlow(em: EntityManager) {
  const out = {
    start$: new Subject<{ collectorId: EntityId }>(),
    finish$: new Subject<CollectItemFlowOut>(),

    itemsCollected$: new Subject<EntityId[]>(),
    noItemsCollected$: new Subject()
  };

  type AssessedOut = TargetPos & {
    collectibleId: EntityId | null;
    collectorId: EntityId;
  } & SuitableForCollectionOut;
  const collectAssessed$ = new Subject<AssessedOut>();

  out.start$
    .pipe(
      take(1),
      map(msg =>
        addProperty(msg, 'targetPos', em.getComponent(msg.collectorId, GridPos))
      ),
      mergeMap(msg => of(...entitiesAtPosition(msg, em, 'collectibleId'))),
      filter(msg => msg.collectibleId !== msg.collectorId),
      map(msg => suitableForCollection(msg, em))
    )
    .subscribe(collectAssessed$);

  collectAssessed$
    .pipe(noneOf(msg => msg.suitableCollectId !== null))
    .subscribe(out.noItemsCollected$);

  collectAssessed$
    .pipe(
      filter(msg => msg.suitableCollectId !== null),
      map(msg => addToInventory(msg, em)),
      map(msg => msg.collectedId),
      toArray(),
      filter(arr => arr.length !== 0)
    )
    .subscribe(out.itemsCollected$);

  collectAssessed$
    .pipe(
      reduce(
        (acc, curr) => {
          acc.collectorId = curr.collectorId;
          if (curr.suitableCollectId !== null) {
            acc.itemsCollected.push(curr.collectibleId);
          } else {
            acc.itemsIgnored.push(curr.collectibleId);
          }
          return acc;
        },
        {
          itemsCollected: [],
          itemsIgnored: [],
          collectorId: null
        } as CollectItemFlowOut
      )
    )
    .subscribe(out.finish$);

  return out;
}
