import * as Chance from 'chance';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AttackOrder, MoveOrder, MovingEntity } from '../systems.types';
import { addProperty, radClone } from '../systems.utils';
import {
  gatherBumpInfo,
  GatherBumpInfoArgs,
} from './gather-bump-info.operator';
import { resolveBump } from './resolve-bump.operator';

type Args = GatherBumpInfoArgs & MovingEntity;
export type AssessBumpMoveArgs = Args;

export function assessBumpMove<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
) {
  return of(msg).pipe(
    mergeMap((msg) =>
      gatherBumpInfo(addProperty(msg, 'aggressorId', msg.movingId), em)
    ),
    mergeMap((msg) => resolveBump(msg, em, rand)),
    map((msg) => {
      let move: MoveOrder = null;
      let attack: AttackOrder = null;
      if (msg.newPosition) {
        move = { newPosition: msg.newPosition, movingId: msg.movingId };
      }
      if (msg.combatTargetId) {
        attack = _.pick(msg, [
          'combatTargetId',
          'aggressorId',
          'strikeSuccess',
          'woundSuccess',
          'armorSaveSuccess',
          'damage',
          'damageTargetId',
          'reapedId',
        ]);
      }
      return { ...radClone(msg), attack, move };
    })
  );
}
