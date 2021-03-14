import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Physical, Size } from '../components/physical.model';
import { GridPos, GridPosData } from '../components/position.model';
import { acquireAoePositions } from '../mappers/acquire-aoe-targets.system';
import { acquireSingleTarget } from '../mappers/acquire-single-target.system';
import { ActiveEffect } from '../systems.types';
import { addProperty } from '../systems.utils';

type Args = ActiveEffect & { selectedPos: GridPosData | null };
export function acquirePositionsPipeline<T extends Args>(
  msg: T,
  em: EntityManager
) {
  return of(msg).pipe(
    map((msg) => acquireAoePositions(msg, em)),
    map((msg) => acquireSingleTarget(msg, em)),
    mergeMap((msg) => {
      if (msg.acquiredPositions === null) {
        return of(addProperty(msg, 'targetPos', null));
      }

      const positions = [
        ...msg.acquiredPositions.filter(
          (pos) =>
            em
              .matchingIndex(new GridPos(pos))
              .filter(
                (e) =>
                  e.has(Physical) && e.component(Physical).size === Size.FILL
              ).length === 0
        ),
      ];
      delete msg.acquiredPositions;
      return of(...positions.map((p) => addProperty(msg, 'targetPos', p)));
    })
  );
}
