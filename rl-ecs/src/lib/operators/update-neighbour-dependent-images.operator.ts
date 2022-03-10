import { addProperty, GridPos, Renderable } from '@rad/rl-ecs';
import {
  asCompassDirectionVec3,
  CompassDirection,
  COMPASS_DIR_SHORT_STRING,
  subVec3,
  ValueMap,
  xyPositionsAround,
} from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { filter, mapTo, mergeMap, tap, toArray } from 'rxjs/operators';
import { NeighbourDisplayAffected } from '../components/neighbour-display-affected.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';

export function updateNeighbourDependentImages(em: EntityManager) {
  return <T>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((preMsg) =>
        of(addProperty({}, 'componentTypes', [NeighbourDisplayAffected])).pipe(
          mergeMap((origMsg) => {
            const ndaMap = new ValueMap<GridPos, Set<string>>();
            return of(...entitiesWithComponents(origMsg, em, 'ndaId')).pipe(
              filter((msg) => msg.ndaId !== null),
              tap((msg) => {
                const [nda, gridPos] = em.getComponents(
                  msg.ndaId,
                  NeighbourDisplayAffected,
                  GridPos
                );
                if (ndaMap.has(gridPos)) {
                  ndaMap.get(gridPos).add(nda.typeId);
                } else {
                  ndaMap.set(gridPos, new Set([nda.typeId]));
                }
              }),
              toArray(),
              mapTo({ ...origMsg, ndaMap })
            );
          }),
          mergeMap((ndaMapMsg) =>
            of(
              ...entitiesWithComponents({ componentTypes: ndaMapMsg.componentTypes }, em, 'ndaId')
            ).pipe(
              filter((msg) => msg.ndaId !== null),
              tap((msg) => {
                const { ndaMap } = ndaMapMsg;
                const [nda, thisPos] = em.getComponents(
                  msg.ndaId,
                  NeighbourDisplayAffected,
                  GridPos
                );
                const unitVecAdjacencies = xyPositionsAround(thisPos)
                  .filter((pos) => ndaMap.get(new GridPos(pos))?.has(nda.typeId))
                  .map((pos) => subVec3(pos, thisPos));

                const countSameAxis = (axis: 'x' | 'y', axisValue: number) => {
                  return unitVecAdjacencies.filter((unitVec) => unitVec[axis] === axisValue).length;
                };
                const filledAxis = ({ x, y }: { x: number; y: number }): 'x' | 'y' | undefined => {
                  if (countSameAxis('x', x) === 3) {
                    return 'x';
                  } else if (countSameAxis('y', y) === 3) {
                    return 'y';
                  } else {
                    return undefined;
                  }
                };

                let adjacencyString = unitVecAdjacencies
                  .filter((unitVec) => {
                    if (!nda.pruneCardinalWhenSurrounded) {
                      return true;
                    }
                    // the intent of the wall type images is to provide an outline around a segment. When there are
                    // many together in one spot then what ends up happening is that each position has 4 connections
                    // and you get a railway type look. The logic here detects when there is a filled volume of positions.
                    // Essentially if there is 2 filled rows adjacent to each other. Easiest to think about is a full
                    // 9 positions, if this is the case you want an outline around all 9, so the central and cardinal
                    // edge pieces need to be ignored connection wise.
                    const axis = filledAxis(unitVec);
                    if (axis) {
                      if (countSameAxis(axis, 0) === 2) {
                        return false;
                      }
                    }
                    return true;
                  })
                  .map((unitVec) => asCompassDirectionVec3(unitVec))
                  .filter(
                    (compass) =>
                      compass === CompassDirection.N ||
                      compass === CompassDirection.E ||
                      compass === CompassDirection.S ||
                      compass === CompassDirection.W
                  )
                  .map((compass) => COMPASS_DIR_SHORT_STRING[compass])
                  .join('_');
                adjacencyString = adjacencyString === '' ? 'NONE' : adjacencyString;
                const image = nda.adjacencyImageMap[adjacencyString].image;
                em.setComponent(msg.ndaId, new Renderable({ image, zOrder: 1 }));
              }),
              toArray(),
              mapTo(preMsg)
            )
          )
        )
      )
    );
  };
}
