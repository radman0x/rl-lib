import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { updateDistanceMap } from '../actioners/update-distance-map.actioner';
import { MoveOrder, WorldStateChangeReport } from '../systems.types';

export type ProcessMoveArgs = { move: MoveOrder | null };
export type ProcessMoveOut = WorldStateChangeReport;

export function processMove(em: EntityManager) {
  return <T extends ProcessMoveArgs>(input: Observable<T>) =>
    input.pipe(
      map((msg) => ({ ...msg, ...msg.move })),
      map((msg) => spatial(msg, em)),
      tap((msg) => updateDistanceMap(msg, em))
    );
}
