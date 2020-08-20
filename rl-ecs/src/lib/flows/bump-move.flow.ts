import { Id } from '@rad/rl-applib';
import { EntityManager } from 'rad-ecs';
import { merge, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
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

interface Blocked {
  isBlocked: boolean;
}

export function attemptMoveFlow(em: EntityManager, rand: Chance.Chance) {
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
