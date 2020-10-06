import { PriorityQueue, ValueMap, xyPositionsAround } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Blockage } from '../components/blockage.model';
import { DistanceMap } from '../components/distance-map.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos, GridPosData } from '../components/position.model';
import { SpatialReport } from '../systems.types';

type Args = SpatialReport;
export type GenerateDistanceMapArgs = Args;

interface Out {
  distanceMap: ValueMap<GridPos, number>;
}
export type GenerateDistanceMapOut = Out;

export interface NodeEntry {
  pos: GridPosData;
  distance: number;
}

export type Walkable = (GridPosData) => boolean;

export type ClosedSet = ValueMap<GridPos, boolean>;
export function neighbours(
  curr: NodeEntry,
  closedSet: ClosedSet,
  walkable: Walkable
) {
  return xyPositionsAround(curr.pos)
    .filter((pos) => !closedSet.has(new GridPos(pos)) && walkable(pos))
    .map((pos) => ({ pos, distance: curr.distance + 1 }));
}

export function dijkstra(locus: GridPosData, walkable: Walkable) {
  const distances: ValueMap<GridPos, number> = new ValueMap();
  const openSet: PriorityQueue<NodeEntry> = new PriorityQueue(
    (lhs, rhs) => lhs.distance < rhs.distance,
    (e) => new GridPos(e.pos).hash()
  );
  const closedSet: ClosedSet = new ValueMap();
  openSet.push({ pos: locus, distance: 0 });
  while (openSet.length()) {
    const curr = openSet.pop();
    const currGridPos = new GridPos(curr.pos);
    closedSet.set(currGridPos, true);
    const assign =
      !distances.has(currGridPos) || curr.distance < distances.get(currGridPos);
    if (assign) {
      distances.set(currGridPos, curr.distance);
    }
    neighbours(curr, closedSet, walkable).forEach((value) => {
      const id = new GridPos(value.pos).hash();
      if (openSet.has(id)) {
        const incumbent = openSet.get(id);

        if (value.distance < incumbent.distance) {
          openSet.update(id, { ...incumbent, distance: value.distance });
        }
      } else {
        openSet.push(value);
      }
    });
  }
  return distances;
}

export function updateDistanceMap(msg: Args | null, em: EntityManager) {
  if (
    msg.spatialReport === null ||
    !em.hasComponent(msg.spatialReport.spatialId, DistanceMap)
  ) {
    return;
  }
  const locus = em.getComponent(msg.spatialReport.spatialId, GridPos);
  if (!locus) {
    throw Error(
      `Locus entity: ${msg.spatialReport.spatialId} doesn't have a position set!`
    );
  }

  const map = dijkstra(locus, (pos: GridPosData) => {
    let canStand =
      em
        .matchingIndex(new GridPos({ ...pos, z: pos.z - 1 }))
        .filter(
          (entity) =>
            entity.has(Physical) &&
            entity.component(Physical).size === Size.FILL
        ).length !== 0;

    let canOccupy =
      em.matchingIndex(new GridPos(pos)).filter((entity) => {
        const occupied =
          entity.has(Physical) && entity.component(Physical).size === Size.FILL;
        const blocked =
          entity.has(Blockage) && entity.component(Blockage).active;
        return occupied || blocked;
      }).length === 0;

    return canStand && canOccupy;
  });

  em.setComponent(msg.spatialReport.spatialId, new DistanceMap({ map }));
}
