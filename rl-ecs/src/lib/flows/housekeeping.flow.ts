import { EntityManager, EntityId } from 'rad-ecs';
import { merge, of, Subject } from 'rxjs';
import {
  map,
  mergeMap,
  reduce,
  tap,
  take,
  concatMap,
  toArray
} from 'rxjs/operators';
import { deprecateKnowledge } from '../actioners/deprecate-knowledge.actioner';
import { Knowledge } from '../components/knowledge.model';
import { GridPos } from '../components/position.model';
import { Sighted } from '../components/sighted.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import {
  fovEntities,
  FOVEntitiesOut,
  FOVEntitiesArgs
} from '../mappers/fov-entities.system';
import { ProtagonistEntity } from '../systems.types';
import { addProperty, radClone } from '../systems.utils';
import { Id, selSuggest, selAddToArray } from '@rad/rl-applib';
import { ValueMap } from '@rad/rl-utils';

import * as _ from 'lodash';
import {
  SeenBreakdown,
  addSeenToKnowledge
} from '../actioners/add-seen-to-knowledge.actioner';
import { aggregateViewed } from '../operators/aggregate-viewed.operator';

export function housekeepingFlow(em: EntityManager) {
  const flowPoints = {
    housekeepStart$: new Subject(),
    updateKnowledge$: new Subject<ProtagonistEntity>(),
    updateSighted$: new Subject<ProtagonistEntity>(),
    entityInVision$: new Subject<ProtagonistEntity & FOVEntitiesOut>(),
    seenEntities$: new Subject<(ProtagonistEntity & FOVEntitiesOut)[]>(),
    blockageEntity$: new Subject<ProtagonistEntity>(),
    updateDistanceMap$: new Subject<ProtagonistEntity>()
  };

  flowPoints.housekeepStart$.subscribe(() => console.log(`Housekeeping!`));

  // hookEntitiesWithComponents(
  //   flowPoints.housekeepStart$,
  //   flowPoints.blockageEntity$,
  //   em,
  //   Blockage
  // );
  // flowPoints.blockageEntity$.subscribe(msg => {
  //   const b = em.getComponent(msg.protagId, Blockage);
  //   if (b) {
  //     for (const trigger of b.triggers) {
  //       const x = em.getComponentByName(msg.protagId, trigger.componentName);
  //       if (x && x[trigger.property] === trigger.value) {
  //         console.log(
  //           `BLOCKING: trigger hit!, setting active to: ${trigger.active}`
  //         );
  //         em.setComponent(
  //           msg.protagId,
  //           new Blockage({ ...b, active: trigger.active })
  //         );
  //       }
  //     }
  //   }
  // });

  flowPoints.housekeepStart$
    .pipe(
      take(1),
      map(() => addProperty({}, 'componentTypes', [Knowledge])),
      mergeMap(msg => of(...entitiesWithComponents(msg, em, 'knowledgeId')))
    )
    .subscribe(msg => deprecateKnowledge(msg, em));

  flowPoints.housekeepStart$
    .pipe(
      take(1),
      map(() => addProperty({}, 'componentTypes', [Sighted, GridPos])),
      mergeMap(msg => of(...entitiesWithComponents(msg, em, 'sightedId'))),
      map(msg => ({
        ...radClone(msg),
        sighted: radClone(em.getComponent(msg.sightedId, Sighted)!),
        viewerPos: radClone(em.getComponent(msg.sightedId, GridPos)!)
      })),
      mergeMap(msg => of(...fovEntities(msg, em))),
      aggregateViewed
    )
    .subscribe(msg => addSeenToKnowledge(em, msg));

  // hookEntitiesWithComponents(
  //   flowPoints.housekeepStart$,
  //   flowPoints.updateDistanceMap$,
  //   em,
  //   DistanceMap
  // );

  // flowPoints.updateDistanceMap$
  //   .pipe(
  //     map(msg => ({ ...radClone(msg), distanceMapEntity: msg.protagId })),
  //     map(msg => ({ ...radClone(msg), componentTypes: [GridPos] })),
  //     mergeMap(msg => of(...entitiesWithComponents(msg, em))),
  //     filter(msg => {
  //       const matchZLevel = em.getComponent(msg.distanceMapEntity, GridPos).z;
  //       const zLevel = em.getComponent(msg.protagId, GridPos).z;
  //       return zLevel === matchZLevel || zLevel === matchZLevel - 1;
  //     }),
  //     filter(
  //       msg =>
  //         (em.hasComponent(msg.protagId, Physical) &&
  //           em.getComponent(msg.protagId, Physical).size === Size.FILL) ||
  //         (em.getComponent(msg.protagId, Blockage) && // this means you can stand on a blockage too, prob not good
  //           em.getComponent(msg.protagId, Blockage).active)
  //     ),
  //     map(msg => ({
  //       ...radClone(msg),
  //       filled: em.getComponent(msg.protagId, GridPos)
  //     })),
  //     mergeMap(msg => of(msg)),
  //     reduce(
  //       (acc, msg) => {
  //         if (acc === null) {
  //           acc = {
  //             ...radClone(msg),
  //             walkable: {
  //               locus: em.getComponent(msg.distanceMapEntity, GridPos),
  //               map: new ValueMap<GridPos, boolean>()
  //             }
  //           };
  //         }
  //         const protagZLevel = acc.walkable.locus.z;
  //         const filledZ = msg.filled.z;
  //         if (filledZ < protagZLevel) {
  //           const standPos = new GridPos({ ...msg.filled, z: protagZLevel });
  //           if (acc.walkable.map.get(standPos) === undefined) {
  //             acc.walkable.map.set(standPos, true);
  //           }
  //         } else {
  //           acc.walkable.map.set(msg.filled, false);
  //         }
  //         return acc;
  //       },
  //       null as null | {
  //         distanceMapEntity: EntityId;
  //         walkable: { locus: GridPos; map: ValueMap<GridPos, boolean> };
  //       }
  //     )
  //   )
  //   .subscribe(msg => {
  //     console.log(`Processing walkable map`);
  //     if (msg === null) {
  //       console.log(
  //         `Input to distance map calc is null, it's possible you completed the housekeeping observable before any next!`
  //       );
  //       return;
  //     }
  //     const worldGraph = new Graph();
  //     const walkableMap = msg.walkable.map;
  //     for (const [, { k: pos, v: passable }] of walkableMap.entries()) {
  //       if (passable) {
  //         worldGraph.setNode(pos.hash(), pos);
  //         const surrounding = xyPositionsAround(pos);
  //         for (const neighbourPos of surrounding) {
  //           const neighbourWalkable = walkableMap.get(
  //             new GridPos(neighbourPos)
  //           );
  //           if (neighbourWalkable) {
  //             worldGraph.setEdge(pos.hash(), new GridPos(neighbourPos).hash());
  //           }
  //         }
  //       }
  //     }

  //     let distanceMap = new ValueMap<GridPos, number>();
  //     let dijkstraMap = alg.dijkstra(worldGraph, msg.walkable.locus.hash());
  //     for (const [nodeId, entry] of Object.entries(dijkstraMap)) {
  //       if (entry.distance !== Infinity && worldGraph.node(nodeId)) {
  //         // console.log(
  //         //   `Pos: ${worldGraph.node(nodeId)} is distant: ${entry.distance}`
  //         // );
  //         distanceMap.set(worldGraph.node(nodeId), entry.distance);
  //       }
  //     }
  //     em.setComponent(
  //       msg.distanceMapEntity,
  //       new DistanceMap({ map: distanceMap })
  //     );

  //     console.log(`Distance mapping processed`);
  //   });

  const housekeepingFlowFinished$ = new Subject();
  const allFlowPoints = flowPoints;
  merge(...Object.values(allFlowPoints)).subscribe({
    complete: () => {
      housekeepingFlowFinished$.next();
      housekeepingFlowFinished$.complete();
    }
  });

  return { ...flowPoints, housekeepingFlowFinished$ };
}
