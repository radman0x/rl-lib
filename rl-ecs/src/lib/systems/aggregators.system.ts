import { EntityManager, Entity, EntityId } from 'rad-ecs';
import { Observable, Subject, of } from 'rxjs';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { acquireCombatTargetAtPosition } from './acquire-combat-target-at-position.system';
import {
  positionNextToEntity,
  PositionNextToEntityArgs
} from './position-next-to-entity.system';
import {
  hasCombatTarget,
  noCombatTarget,
  canOccupyStandAndNotBlocked,
  radClone
} from '../systems.utils';
import {
  ProtagonistEntity,
  TargetPos,
  CombatTarget,
  EnteredPos,
  TargetEntity,
  ActiveEffect
} from '../systems.types';
import { canOccupyPosition } from './can-occupy-position.system';
import { canStandAtPosition } from './can-stand-at-position.system';
import { placeEntityAt } from './place-entity-at.system';
import { acquireEntityPosition } from './acquire-entity-position.system';
import { entitiesAtPosition } from './entities-at-position.system';
import { positionBlocked } from './position-blocked.system';
import { Effects } from '../components/effects.model';
import { Climbable } from '../components/climbable.model';

export function hookMoveOrder<T extends PositionNextToEntityArgs>(
  source: Observable<T>,
  dest: Subject<TargetPos & ProtagonistEntity>,
  em: EntityManager
) {
  source
    .pipe(
      map(msg => positionNextToEntity(msg, em)),
      map(msg => acquireCombatTargetAtPosition(msg, em)),
      filter(noCombatTarget)
    )
    .subscribe(dest);
}

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

export function hookCombatOrder<T extends PositionNextToEntityArgs>(
  source: Observable<T>,
  dest: Subject<CombatTarget & ProtagonistEntity>,
  em: EntityManager
) {
  source
    .pipe(
      map(msg => positionNextToEntity(msg, em)),
      map(msg => acquireCombatTargetAtPosition(msg, em)),
      filter(hasCombatTarget)
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
