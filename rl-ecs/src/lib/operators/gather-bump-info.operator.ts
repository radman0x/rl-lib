import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  acquireCombatTargetAtPosition,
  AcquireCombatTargetAtPositionArgs,
} from '../mappers/acquire-combat-target-at-position.system';
import {
  canOccupyPosition,
  CanOccupyPositionArgs,
} from '../mappers/can-occupy-position.system';
import {
  CanStandAtArgs,
  canStandAtPosition,
} from '../mappers/can-stand-at-position.system';
import {
  positionBlocked,
  PositionBlockedArgs,
} from '../mappers/position-blocked.system';

type Args = PositionBlockedArgs &
  CanOccupyPositionArgs &
  CanStandAtArgs &
  AcquireCombatTargetAtPositionArgs;
export type GatherBumpInfoArgs = Args;

export function gatherBumpInfo<T extends Args>(msg: T, em: EntityManager) {
  return of(msg).pipe(
    map((msg) => positionBlocked(msg, em)),
    map((msg) => canOccupyPosition(msg, em)),
    map((msg) => canStandAtPosition(msg, em)),
    map((msg) => acquireCombatTargetAtPosition(msg, em))
  );
}
