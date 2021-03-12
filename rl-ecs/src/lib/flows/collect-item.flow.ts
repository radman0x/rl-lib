import { EntityId, EntityManager } from 'rad-ecs';
import { of, Subject } from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  reduce,
  shareReplay,
  take,
  toArray,
} from 'rxjs/operators';
import { addToInventory } from '../actioners/add-to-inventory.actioner';
import { GridPos } from '../components/position.model';
import { entitiesAtPosition } from '../mappers/entities-at-position.system';
import { suitableForCollection } from '../mappers/suitable-for-collection.mapper';
import { noneOf } from '../operators/none-of.operator';
import { addProperty } from '../systems.utils';

import * as rxjsSpy from 'rxjs-spy';
import { logName } from '@rad/rl-applib';
import { Description } from '@rad/rl-ecs';

export type CollectItemFlowOut = {
  collectorId: EntityId | null;
  itemsCollected: EntityId[];
  itemsIgnored: EntityId[];
  messages: string[];
};

type Args = { collectorId: EntityId; messages: [] };

export function collectItemFlow<T extends Args>(
  em: EntityManager,
  tagBase: string
) {
  tagBase = logName(tagBase, 'collectItemFlow');
  const start$ = new Subject<T>();

  const collectAssessed$ = start$.pipe(
    take(1),
    map((msg) =>
      addProperty(msg, 'targetPos', em.getComponent(msg.collectorId, GridPos))
    ),
    mergeMap((msg) => of(...entitiesAtPosition(msg, em, 'collectibleId'))),
    filter((msg) => msg.collectibleId !== msg.collectorId),
    map((msg) => suitableForCollection(msg, em)),
    shareReplay(),
    rxjsSpy.operators.tag(logName(tagBase, 'collectAssessed'))
  );

  const noItemsCollected$ = collectAssessed$.pipe(
    noneOf((msg) => msg.suitableCollectId !== null)
  );
  noItemsCollected$.subscribe();

  const itemsCollected$ = collectAssessed$.pipe(
    filter((msg) => msg.suitableCollectId !== null),
    map((msg) => addToInventory(msg, em)),
    map((msg) => msg.collectedId),
    toArray(),
    filter((arr) => arr.length !== 0),
    shareReplay(),
    rxjsSpy.operators.tag(logName(tagBase, 'itemCollected'))
  );
  itemsCollected$.subscribe();

  const finish$ = collectAssessed$.pipe(
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
        collectorId: null,
        messages: [],
      }
    ),
    map((msg) => {
      msg.messages = [
        ...msg.messages,
        msg.itemsCollected
          .map((id) => em.getComponent(id, Description)?.short ?? 'unnamed')
          .map((desc) => `Pick up a ${desc}.`)
          .join(` `),
      ];
      return msg;
    })
  );

  return { start$, itemsCollected$, noItemsCollected$, finish$ };
}

export function collectItemFlowInstant<T extends Args>(
  msg: T,
  em: EntityManager,
  tagBase: string
) {
  const flow = collectItemFlow(em, tagBase);
  of(msg).subscribe(flow.start$);
  return flow;
}
