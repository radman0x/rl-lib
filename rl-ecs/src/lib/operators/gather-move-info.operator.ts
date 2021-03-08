import { MoveOrder, MovingEntity, radClone } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { canOccupyPosition } from '../mappers/can-occupy-position.system';
import { canStandAtPosition } from '../mappers/can-stand-at-position.system';
import { positionBlocked } from '../mappers/position-blocked.system';
import { resolveMove } from '../mappers/resolve-move.system';
import { TargetPos } from '../systems.types';

export type GatherMoveInfoArgs = MovingEntity & TargetPos;

export type GatherMoveInfoOut = { move: MoveOrder | null };
export function gatherMoveInfo(em: EntityManager) {
  return <T extends GatherMoveInfoArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => positionBlocked(msg, em)),
      map((msg) => canOccupyPosition(msg, em)),
      map((msg) => canStandAtPosition(msg, em)),
      resolveMove,
      map((msg) => {
        let move: MoveOrder = null;
        if (msg.newPosition) {
          move = { newPosition: msg.newPosition, movingId: msg.movingId };
        }
        return { ...radClone(msg), move };
      })
    );
  };
}
