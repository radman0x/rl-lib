import { Id } from '@rad/rl-applib';
import { EntityManager } from 'rad-ecs';
import { merge, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import {
  BumpMoveAssessment,
  bumpMoveAssessor
} from '../assessors/bump-move.assessor';
import { integrity } from '../mappers/integrity.system';
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
import { radClone } from '../systems.utils';
import { CompassDirection } from '@rad/rl-utils';
import { positionNextToEntity } from '../mappers/position-next-to-entity.system';
import { assessBumpMove } from '../operators/bump-move.operator';

interface Blocked {
  isBlocked: boolean;
}

export function attemptMoveFlow(em: EntityManager, rand: Chance.Chance) {
  const out = {
    start$: new Subject<MovingEntity & { direction: CompassDirection }>(),
    finish$: new Subject<BumpMoveAssessment>(),
    moved$: new Subject<BumpMoveAssessment>(),
    attacked$: new Subject<BumpMoveAssessment>(),
    noActionTaken$: new Subject()
  };

  const assessed$ = new Subject<BumpMoveAssessment>();
  out.start$
    .pipe(
      take(1),
      map(msg =>
        positionNextToEntity(
          {
            ...radClone(msg),
            protagId: msg.movingId,
            aggressorId: msg.movingId
          },
          em
        )
      ),
      assessBumpMove(em, rand)
    )
    .subscribe(assessed$);

  assessed$
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

  assessed$
    .pipe(
      map(msg => {
        console.log(`${JSON.stringify(msg)}`);
        return msg;
      }),
      filter(msg => !!(!msg.attack && msg.move)),
      map(msg => ({
        ...radClone(msg),
        movingId: msg.move.movingId,
        newPosition: msg.move.newPosition
      })),
      map(msg => spatial(msg, em))
    )
    .subscribe(out.moved$);

  assessed$
    .pipe(filter(msg => !!(!msg.attack && !msg.move)))
    .subscribe(out.noActionTaken$);

  merge(out.attacked$, out.moved$, out.noActionTaken$).subscribe(out.finish$);

  return out;
}
