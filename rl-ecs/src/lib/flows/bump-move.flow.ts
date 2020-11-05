import { CompassDirection } from '@rad/rl-utils';
import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observer, of, Subject } from 'rxjs';
import { filter, map, share, shareReplay, tap } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { updateDistanceMap } from '../actioners/update-distance-map.actioner';
import { Description } from '../components/description.model';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity } from '../mappers/integrity.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import { positionNextToEntity } from '../mappers/position-next-to-entity.system';
import { assessBumpMove } from '../operators/assess-bump-move.operator';
import {
  AttackOrder,
  EffectReport,
  MoveOrder,
  MovingEntity,
  ReapedEntity,
} from '../systems.types';
import { radClone } from '../systems.utils';

import * as rxjsSpy from 'rxjs-spy';
import { logName } from '@rad/rl-applib';

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

type Args = MovingEntity & { direction: CompassDirection };

export function attemptMoveFlow<T extends Args>(
  em: EntityManager,
  rand: Chance.Chance,
  messageLog: (string) => void = null,
  tagBase: string = ''
) {
  tagBase = logName(tagBase, 'attemptMoveFlow');
  const start$ = new Subject<T>();
  const assessed$ = start$.pipe(
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
    map((msg) => assessBumpMove(msg, em, rand)),
    rxjsSpy.operators.tag(logName(tagBase, 'assessed')),
    shareReplay()
  );

  const attacked$ = assessed$.pipe(
    filter((msg) => !!msg.attack),
    map((msg) => ({ ...msg.attack, effectReport: null })),
    map((msg) => {
      console.log(`${JSON.stringify(msg, null, 2)}`);
      return msg;
    }),
    map((msg) => integrity(msg, em)),
    map((msg) => markForDeath(msg, em)),
    tap((msg) => messageLog && messageLog(playerAttackString(em, msg))),
    map((msg) => grimReaper(msg, em)),
    rxjsSpy.operators.tag(logName(tagBase, 'attacked')),
    shareReplay()
  );
  attacked$.subscribe();

  const moved$ = assessed$.pipe(
    filter((msg) => !!(!msg.attack && msg.move)),
    map((msg) => ({ ...msg.move, effectReport: null })),
    map((msg) => spatial(msg, em)),
    tap((msg) => updateDistanceMap(msg, em)),
    rxjsSpy.operators.tag(logName(tagBase, 'moved')),
    shareReplay()
  );
  moved$.subscribe();

  const noActionTaken$ = assessed$.pipe(
    filter((msg) => !!(!msg.attack && !msg.move)),
    rxjsSpy.operators.tag(logName(tagBase, 'noActionTaken')),
    shareReplay()
  );
  noActionTaken$.subscribe();

  return { start$, attacked$, moved$, noActionTaken$ };
}

export function attemptMoveFlowInstant<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance,
  messageLog: (string) => void = null,
  tagBase: string = ''
) {
  const flow = attemptMoveFlow(em, rand, messageLog, tagBase);
  of(msg).subscribe(flow.start$);
  return flow;
}
