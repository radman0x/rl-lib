import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import {
  CanOccupyPositionArgs,
  canOccupyPosition
} from './mappers/can-occupy-position.system';
import {
  CanStandAtArgs,
  canStandAtPosition
} from './mappers/can-stand-at-position.system';
import { map } from 'rxjs/operators';
import { positionBlocked } from './mappers/position-blocked.system';
import { acquireCombatTargetAtPosition } from './mappers/acquire-combat-target-at-position.system';

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
