import { Id } from '@rad/rl-applib';
import { CompassDirection } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { merge, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity } from '../mappers/integrity.system';
import { positionNextToEntity } from '../mappers/position-next-to-entity.system';
import { spatial } from '../actioners/spatial.actioner';
import { gatherBumpInfo } from '../operators/gather-bump-info.operator';
import { resolveBump } from '../operators/resolve-bump.operator';
import {
  CanOccupy,
  CanStand,
  CombatResult,
  CombatTargetEntity,
  Damaged,
  DamageTargetEntity,
  MovingEntity,
  NewPosition,
  ProtagonistEntity,
  TargetPos
} from '../systems.types';
import {
  hasCombatTarget,
  hasNewPosition,
  noCombatTarget,
  noNewPosition,
  radClone
} from '../systems.utils';
import {
  bumpMoveAssessor,
  BumpMoveAssessment
} from '../assessors/bump-move.assessor';

interface Blocked {
  isBlocked: boolean;
}

export function attemptMoveFlow(em: EntityManager, rand: Chance.Chance) {
  type All = Id<
    MovingEntity &
      DamageTargetEntity &
      CombatTargetEntity &
      ProtagonistEntity &
      CanStand &
      CanOccupy &
      CombatResult &
      Damaged &
      TargetPos &
      Blocked &
      NewPosition
  >;

  const assessor = bumpMoveAssessor(em, rand);

  const out = {
    start$: assessor.start$,
    finish$: new Subject<BumpMoveAssessment>(),
    moved$: new Subject<BumpMoveAssessment>(),
    attacked$: new Subject<BumpMoveAssessment>(),
    noActionTaken$: new Subject()
  };

  assessor.finish$
    .pipe(
      filter(msg => !!msg.attack),
      map(msg => ({
        ...radClone(msg),
        damageTargetId: msg.attack.combatTargetId,
        damage: msg.attack.damage
      })),
      map(msg => integrity(msg, em))
    )
    .subscribe(out.attacked$);

  out.attacked$.subscribe(() => console.log(`ATTACKED!!!!`));

  assessor.finish$
    .pipe(
      filter(msg => !!(!msg.attack && msg.move)),
      map(msg => ({
        ...radClone(msg),
        movingId: msg.move.movingId,
        newPosition: msg.move.newPos
      })),
      map(msg => spatial(msg, em))
    )
    .subscribe(out.moved$);

  assessor.finish$
    .pipe(filter(msg => !!(!msg.attack && !msg.move)))
    .subscribe(out.noActionTaken$);

  merge(out.attacked$, out.moved$, out.noActionTaken$).subscribe(out.finish$);

  return out;
}
