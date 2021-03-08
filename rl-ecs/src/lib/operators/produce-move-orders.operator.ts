import { EntityId, EntityManager } from 'rad-ecs';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { filter, map, mergeMap, take } from 'rxjs/operators';
import { Mobile } from '../components/mobile.model';
import { canOccupyPosition } from '../mappers/can-occupy-position.system';
import { canStandAtPosition } from '../mappers/can-stand-at-position.system';
import { knownDistanceMaps } from '../mappers/known-distance-maps.system';
import { positionBlocked } from '../mappers/position-blocked.system';
import { positionsAroundEntity } from '../mappers/positions-around-entity.system';
import { resolveMove } from '../mappers/resolve-move.system';
import { MoveOrder, Order } from '../systems.types';
import { addProperty } from '../systems.utils';

interface Args {
  agentId: EntityId;
}
export function produceMoveOrders<T extends Args>(
  msg: T,
  em: EntityManager
): Observable<Order> {
  const out: BehaviorSubject<T> = new BehaviorSubject(msg);

  return out
    .pipe(
      take(1),
      map((msg) => addProperty(msg, 'movingId', msg.agentId)),
      mergeMap((msg) => {
        return merge(
          new BehaviorSubject(msg).pipe(
            take(1),
            filter(
              (msg) => msg.agentId && em.hasComponent(msg.agentId, Mobile)
            ),
            mergeMap((msg) => of(...positionsAroundEntity(msg, em)))
          )
        );
      }),
      map((msg) => positionBlocked(msg, em)),
      map((msg) => canOccupyPosition(msg, em)),
      map((msg) => canStandAtPosition(msg, em))
    )
    .pipe(
      resolveMove,
      map((msg) => {
        let move: MoveOrder = null;
        if (msg.newPosition) {
          move = {
            newPosition: msg.newPosition,
            movingId: msg.movingId,
          };
        }
        const result: Order = {
          agentId: msg.agentId,
          move,
          attack: null,
          score: null,
          orderDescription: '',
        };
        return result;
      })
    );
}
