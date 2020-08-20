import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { acquireCombatTargetAtPosition } from '../mappers/acquire-combat-target-at-position.system';
import {
  canOccupyPosition,
  CanOccupyPositionArgs
} from '../mappers/can-occupy-position.system';
import {
  CanStandAtArgs,
  canStandAtPosition
} from '../mappers/can-stand-at-position.system';
import { positionBlocked } from '../mappers/position-blocked.system';

export function gatherBumpInfo(em: EntityManager) {
  return <T>(input: Observable<CanOccupyPositionArgs & CanStandAtArgs & T>) => {
    return input.pipe(
      map(msg => positionBlocked(msg, em)),
      map(msg => canOccupyPosition(msg, em)),
      map(msg => canStandAtPosition(msg, em)),
      map(msg => acquireCombatTargetAtPosition(msg, em))
    );
  };
}
