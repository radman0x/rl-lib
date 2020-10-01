import { CompassDirection } from '@rad/rl-utils';
import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Subject } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { updateDistanceMap } from '../actioners/update-distance-map.actioner';
import { BumpMoveAssessment } from '../assessors/bump-move.assessor';
import { Description } from '../components/description.model';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity } from '../mappers/integrity.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import { positionNextToEntity } from '../mappers/position-next-to-entity.system';
import { assessBumpMove } from '../operators/assess-bump-move.operator';
import {
  AttackOrder,
  MoveOrder,
  MovingEntity,
  ReapedEntity,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';

function playerAttackString(
  em: EntityManager,
  msg: {
    combatTargetId: EntityId;
    damage: { amount: number };
    strikeSuccess: boolean;
    woundSuccess: boolean;
  } & ReapedEntity
): string {
  const pluraler = (n: number) => (n === 1 ? '' : 's');
  const targetDescription = em.hasComponent(msg.combatTargetId, Description)
    ? em.getComponent(msg.combatTargetId, Description).short
    : 'unnamed';
  if (msg.reapedId) {
    return `The ${targetDescription} is killed!`;
  }
  if (msg.woundSuccess && msg.strikeSuccess) {
    return `You hit the ${targetDescription}, inflicting ${
      msg.damage.amount
    } wound${pluraler(msg.damage.amount)}`;
  } else if (msg.strikeSuccess) {
    return `You hit the ${targetDescription} but fail to cause any damage`;
  } else {
    return `You miss the ${targetDescription}`;
  }
}

export function attemptMoveFlow(
  em: EntityManager,
  rand: Chance.Chance,
  messageLog: (string) => void = null
) {
  const out = {
    start$: new Subject<MovingEntity & { direction: CompassDirection }>(),
    finish$: new Subject<BumpMoveAssessment>(),
    moved$: new Subject<MoveOrder & WorldStateChangeReport>(),
    attacked$: new Subject<AttackOrder & WorldStateChangeReport>(),
    noActionTaken$: new Subject(),
  };

  const assessed$ = new Subject<BumpMoveAssessment>();
  out.start$
    .pipe(
      take(1),
      map((msg) =>
        positionNextToEntity(
          {
            ...radClone(msg),
            protagId: msg.movingId,
            aggressorId: msg.movingId,
          },
          em
        )
      ),
      map((msg) => assessBumpMove(msg, em, rand))
    )
    .subscribe(assessed$);

  assessed$
    .pipe(
      filter((msg) => !!msg.attack),
      map((msg) => ({ ...msg.attack })),
      map((msg) => integrity(msg, em)),
      map((msg) => markForDeath(msg, em)),
      map((msg) => {
        console.log(`${JSON.stringify(msg, null, 2)}`);
        return msg;
      }),
      tap((msg) => messageLog && messageLog(playerAttackString(em, msg))),
      map((msg) => grimReaper(msg, em))
    )
    .subscribe(out.attacked$);

  out.attacked$.subscribe(() => console.log(`ATTACKED!!!!`));

  assessed$
    .pipe(
      filter((msg) => !!(!msg.attack && msg.move)),
      map((msg) => ({ ...msg.move })),
      map((msg) => spatial(msg, em)),
      tap((msg) => updateDistanceMap(msg, em))
    )
    .subscribe(out.moved$);

  assessed$
    .pipe(filter((msg) => !!(!msg.attack && !msg.move)))
    .subscribe(out.noActionTaken$);

  merge(out.attacked$, out.moved$, out.noActionTaken$).subscribe(out.finish$);

  return out;
}
