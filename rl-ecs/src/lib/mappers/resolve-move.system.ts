import { isValidId } from '@rad/rl-utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CanOccupy,
  CanStand,
  IsBlocked,
  MovingEntity,
  TargetPos,
} from '../systems.types';
import { addProperty } from '../systems.utils';

type Args = MovingEntity & CanStand & CanOccupy & TargetPos & IsBlocked;
export type ResolveMoveArgs = Args;

export function resolveMove<T extends Args>(input: Observable<T>) {
  return input.pipe(
    map((msg) => {
      if (
        msg.canOccupy &&
        msg.canStand &&
        !msg.isBlocked &&
        isValidId(msg.movingId)
      ) {
        return addProperty(msg, 'newPosition', msg.targetPos);
      }
      return addProperty(msg, 'newPosition', null);
    })
  );
}
