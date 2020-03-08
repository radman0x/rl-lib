import { Entity, EntityManager } from 'rad-ecs';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import {
  EnteredPos,
  ProtagonistEntity,
  TargetEntity,
  TargetPos
} from '../systems.types';
import { canOccupyStandAndNotBlocked } from '../systems.utils';
import { acquireEntityPosition } from './acquire-entity-position.system';
import { canOccupyPosition } from './can-occupy-position.system';
import { canStandAtPosition } from './can-stand-at-position.system';
import { entitiesAtPosition } from './entities-at-position.system';
import { placeEntityAt } from './place-entity-at.system';
import { positionBlocked } from './position-blocked.system';

export function hookPerformMove<T extends TargetPos & ProtagonistEntity>(
  source: Observable<T>,
  dest: Subject<ProtagonistEntity & EnteredPos>,
  em: EntityManager
) {
  source
    .pipe(
      map(msg => positionBlocked(msg, em)),
      map(msg => canOccupyPosition(msg, em)),
      map(msg => canStandAtPosition(msg, em)),
      filter(canOccupyStandAndNotBlocked),
      map(msg => placeEntityAt(msg, em))
    )
    .subscribe(dest);
}

export function hookEntitiesAtProtagPos<T extends ProtagonistEntity>(
  source: Observable<T>,
  dest: Subject<ProtagonistEntity & TargetEntity>,
  em: EntityManager,
  predicate: (e: Entity) => boolean = () => true
) {
  source
    .pipe(
      map(msg => acquireEntityPosition(msg, em)),
      mergeMap(msg =>
        of(
          ...entitiesAtPosition(
            msg,
            em,
            e => e.id !== msg.protagId && predicate(e)
          )
        )
      )
    )
    .subscribe(dest);
}
