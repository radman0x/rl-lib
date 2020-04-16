import { CompassDirection } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Subject, merge } from 'rxjs';
import { filter, map, tap, take } from 'rxjs/operators';
import { AreaResolver } from '../area-resolver.model';
import { gatherBumpInfo } from '../general.utils';
import {
  CanOccupy,
  CanStand,
  CombatResult,
  CombatTargetEntity,
  DamageType,
  MovingEntity,
  TargetPos,
  DamageTargetEntity,
  Damaged,
  ProtagonistEntity,
  StrikeResult,
  WoundResult,
  NewPosition
} from '../systems.types';
import {
  noCombatTarget,
  radClone,
  hasCombatTarget,
  hasNewPosition,
  noNewPosition
} from '../systems.utils';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity } from '../mappers/integrity.system';
import { positionNextToEntity } from '../mappers/position-next-to-entity.system';
import { resolveMeleeAttackDamage } from '../mappers/resolve-melee-attack-damage.system';
import { resolveMove } from '../mappers/resolve-move.system';
import { resolveStrike } from '../mappers/resolve-strike.system';
import { resolveWound } from '../mappers/resolve-wound.system';
import { spatial } from '../mappers/spatial.system';

import * as Chance from 'chance';

interface Blocked {
  isBlocked: boolean;
}

export function attemptMoveFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  rand: Chance.Chance
) {
  type All = MovingEntity &
    DamageTargetEntity &
    CombatTargetEntity &
    ProtagonistEntity &
    CanStand &
    CanOccupy &
    CombatResult &
    Damaged &
    TargetPos &
    Blocked &
    NewPosition;

  const out = {
    start$: new Subject<MovingEntity & { direction: CompassDirection }>(),
    finish$: new Subject<All>(),
    moved$: new Subject(),
    attacked$: new Subject<
      ProtagonistEntity & CombatTargetEntity & CombatResult
    >(),
    noActionTaken$: new Subject()
  };

  const internal = {
    bumpAssessed$: new Subject<All>()
  };

  out.start$
    .pipe(
      take(1),
      map(msg =>
        positionNextToEntity({ ...radClone(msg), protagId: msg.movingId }, em)
      ),
      gatherBumpInfo(em),
      map(msg => resolveStrike(msg, em, rand)),
      map(msg => resolveWound(msg, em, rand)),
      map(msg => resolveMeleeAttackDamage(msg, em)),
      map(msg => resolveMove(msg, em))
    )
    .subscribe(internal.bumpAssessed$);

  internal.bumpAssessed$
    .pipe(
      filter(hasCombatTarget),
      map(msg => integrity(msg, em)),
      map(msg => grimReaper(msg, em))
    )
    .subscribe(out.attacked$);

  out.attacked$.subscribe(() => console.log(`ATTACKED!!!!`));

  internal.bumpAssessed$
    .pipe(
      filter(noCombatTarget),
      filter(hasNewPosition),
      map(msg => spatial(msg, em))
    )
    .subscribe(out.moved$);

  internal.bumpAssessed$
    .pipe(
      filter(noCombatTarget),
      filter(noNewPosition)
    )
    .subscribe(out.noActionTaken$);

  merge(out.attacked$, out.moved$, out.noActionTaken$).subscribe(out.finish$);

  return out;
}
