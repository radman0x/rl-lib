import { ValueMap, xyPositionsAround } from '@rad/rl-utils';
import { alg, Graph } from 'graphlib';
import { Entity, EntityManager } from 'rad-ecs';
import { GridPos, Physical, Size } from '..';
import { GridPosData } from './components/position.model';

export function calcDijkstrapMap(
  em: EntityManager,
  start: GridPosData
): ValueMap<GridPos, number> {
  let worldGraph = new Graph();
  let walkableMap = new ValueMap<
    GridPos,
    { blocked: boolean; hasFloor: boolean }
  >();
  let asId = (c: GridPosData) => `${c.x}, ${c.y}, ${c.z}`;
  em.each(
    (e: Entity, p: GridPos, py: Physical) => {
      let walkablePos = new GridPos({ x: p.x, y: p.y, z: 0 });
      let walkableEntry = walkableMap.get(walkablePos);

      worldGraph.setNode(asId(walkablePos), walkablePos);

      if (!walkableEntry) {
        walkableEntry = { blocked: false, hasFloor: false };
        walkableMap.set(walkablePos, walkableEntry);
      }
      if (p.z === 0 && py.size === Size.FILL) {
        walkableEntry.blocked = true;
      } else if (p.z === -1 && py.size === Size.FILL) {
        walkableEntry.hasFloor = true;
      }
    },
    GridPos,
    Physical
  );

  for (const [pos, details] of walkableMap) {
    if (!details.blocked && details.hasFloor) {
      const surrounding = xyPositionsAround(pos);
      for (const neighbourCoord of surrounding) {
        const neighbourPos = new GridPos(neighbourCoord);
        const neighbourWalkable = walkableMap.get(neighbourPos);
        if (
          neighbourWalkable &&
          !neighbourWalkable.blocked &&
          neighbourWalkable.hasFloor
        ) {
          worldGraph.setEdge(asId(pos), asId(neighbourPos));
        }
      }
    }
  }

  let distanceMap = new ValueMap<GridPos, number>();
  for (const [nodeId, entry] of Object.entries(
    alg.dijkstra(worldGraph, asId(start))
  )) {
    if (entry.distance !== Infinity && worldGraph.node(nodeId)) {
      distanceMap.set(worldGraph.node(nodeId), entry.distance);
    }
  }
  return distanceMap;
}
