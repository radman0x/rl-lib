import { ValueMap, xyPositionsAround } from '@rad/rl-utils';
import { alg, Graph } from 'graphlib';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, of, Subject } from 'rxjs';
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators';
import { Blockage } from './components/blockage.model';
import { DistanceMap } from './components/distance-map.model';
import { Knowledge } from './components/knowledge.model';
import { Physical, Size } from './components/physical.model';
import { GridPos } from './components/position.model';
import { Sighted } from './components/sighted.model';
import { ProtagonistEntity } from './systems.types';
import { radClone } from './systems.utils';
import {
  entitiesWithComponents,
  hookEntitiesWithComponents
} from './systems/entities-with-component.system';
import { FOVEntitiesOut, hookFOVEntities } from './systems/fov-entities.system';

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

  hookEntitiesWithComponents(
    flowPoints.housekeepStart$,
    flowPoints.blockageEntity$,
    em,
    Blockage
  );
  flowPoints.blockageEntity$.subscribe(msg => {
    const b = em.getComponent(msg.protagId, Blockage);
    if (b) {
      for (const trigger of b.triggers) {
        const x = em.getComponentByName(msg.protagId, trigger.componentName);
        if (x && x[trigger.property] === trigger.value) {
          console.log(
            `BLOCKING: trigger hit!, setting active to: ${trigger.active}`
          );
          em.setComponent(
            msg.protagId,
            new Blockage({ ...b, active: trigger.active })
          );
        }
      }
    }
  });

  hookEntitiesWithComponents(
    flowPoints.housekeepStart$,
    flowPoints.updateKnowledge$,
    em,
    Knowledge
  );

  flowPoints.updateKnowledge$.subscribe(msg => {
    console.log(`Update knowledge`);
    const knowledge = em.getComponent(msg.protagId, Knowledge);
    for (const [pos, ids] of knowledge.current) {
      knowledge.history.set(pos, ids);
    }
    em.setComponent(
      msg.protagId,
      new Knowledge({
        current: new ValueMap(),
        history: knowledge.history
      })
    );
  });

  hookEntitiesWithComponents(
    flowPoints.housekeepStart$,
    flowPoints.updateSighted$,
    em,
    Sighted
  );

  hookFOVEntities(flowPoints.updateSighted$, flowPoints.entityInVision$, em);

  flowPoints.entityInVision$
    .pipe(
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, [])
    )
    .subscribe(flowPoints.seenEntities$);

  flowPoints.seenEntities$.subscribe(msgs => {
    console.log(`Update seeing`);
    if (msgs.length !== 0) {
      const protagId = msgs[0].protagId;
      const knowledge = em.getComponent(protagId, Knowledge);
      const currentKnowledge = knowledge.current;
      for (const seen of msgs) {
        const knowledgeAtPos = currentKnowledge.get(seen.viewed.atPos) || [];
        knowledgeAtPos.push(seen.viewed.entityId);
        currentKnowledge.set(seen.viewed.atPos, knowledgeAtPos);
      }
      em.setComponent(
        protagId,
        new Knowledge({
          current: currentKnowledge,
          history: knowledge.history
        })
      );
      console.log(`Sighted entities updated`);
    }
  });

  hookEntitiesWithComponents(
    flowPoints.housekeepStart$,
    flowPoints.updateDistanceMap$,
    em,
    DistanceMap
  );

  flowPoints.updateDistanceMap$
    .pipe(
      map(msg => ({ ...radClone(msg), distanceMapEntity: msg.protagId })),
      map(msg => ({ ...radClone(msg), componentTypes: [GridPos] })),
      mergeMap(msg => of(...entitiesWithComponents(msg, em))),
      filter(msg => {
        const matchZLevel = em.getComponent(msg.distanceMapEntity, GridPos).z;
        const zLevel = em.getComponent(msg.protagId, GridPos).z;
        return zLevel === matchZLevel || zLevel === matchZLevel - 1;
      }),
      filter(
        msg =>
          (em.hasComponent(msg.protagId, Physical) &&
            em.getComponent(msg.protagId, Physical).size === Size.FILL) ||
          (em.getComponent(msg.protagId, Blockage) && // this means you can stand on a blockage too, prob not good
            em.getComponent(msg.protagId, Blockage).active)
      ),
      map(msg => ({
        ...radClone(msg),
        filled: em.getComponent(msg.protagId, GridPos)
      })),
      mergeMap(msg => of(msg)),
      reduce(
        (acc, msg) => {
          if (acc === null) {
            acc = {
              ...radClone(msg),
              walkable: {
                locus: em.getComponent(msg.distanceMapEntity, GridPos),
                map: new ValueMap<GridPos, boolean>()
              }
            };
          }
          const protagZLevel = acc.walkable.locus.z;
          const filledZ = msg.filled.z;
          if (filledZ < protagZLevel) {
            const standPos = new GridPos({ ...msg.filled, z: protagZLevel });
            if (acc.walkable.map.get(standPos) === undefined) {
              acc.walkable.map.set(standPos, true);
            }
          } else {
            acc.walkable.map.set(msg.filled, false);
          }
          return acc;
        },
        null as {
          distanceMapEntity: EntityId;
          walkable: { locus: GridPos; map: ValueMap<GridPos, boolean> };
        }
      )
    )
    .subscribe(msg => {
      console.log(`Processing walkable map`);
      if (msg === null) {
        console.log(
          `Input to distance map calc is null, it's possible you completed the housekeeping observable before any next!`
        );
      }
      const worldGraph = new Graph();
      const walkableMap = msg.walkable.map;
      for (const [, { k: pos, v: passable }] of walkableMap.entries()) {
        if (passable) {
          worldGraph.setNode(pos.hash(), pos);
          const surrounding = xyPositionsAround(pos);
          for (const neighbourPos of surrounding) {
            const neighbourWalkable = walkableMap.get(
              new GridPos(neighbourPos)
            );
            if (neighbourWalkable) {
              worldGraph.setEdge(pos.hash(), new GridPos(neighbourPos).hash());
            }
          }
        }
      }

      let distanceMap = new ValueMap<GridPos, number>();
      let dijkstraMap = alg.dijkstra(worldGraph, msg.walkable.locus.hash());
      for (const [nodeId, entry] of Object.entries(dijkstraMap)) {
        if (entry.distance !== Infinity && worldGraph.node(nodeId)) {
          // console.log(
          //   `Pos: ${worldGraph.node(nodeId)} is distant: ${entry.distance}`
          // );
          distanceMap.set(worldGraph.node(nodeId), entry.distance);
        }
      }
      em.setComponent(
        msg.distanceMapEntity,
        new DistanceMap({ map: distanceMap })
      );

      console.log(`Distance mapping processed`);
    });

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
