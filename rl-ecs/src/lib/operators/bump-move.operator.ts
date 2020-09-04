import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BumpMoveAssessment } from '../assessors/bump-move.assessor';
import { radClone } from '../systems.utils';
import { gatherBumpInfo } from './gather-bump-info.operator';
import { resolveBump } from './resolve-bump.operator';

export function assessBumpMove(em: EntityManager, rand: Chance.Chance) {
  return <T>(input: Observable<T & BumpMoveAssessment>) => {
    return input.pipe(
      gatherBumpInfo(em),
      resolveBump(em, rand),
      map(msg => {
        let move = null;
        let attack = null;
        if (msg.newPosition) {
          move = { newPosition: msg.newPosition, movingId: msg.movingId };
        }
        if (msg.combatTargetId) {
          attack = _.pick(msg, [
            'combatTargetId',
            'aggressorId',
            'strikeSuccess',
            'woundSuccess',
            'damage'
          ]);
        }

        return { ...radClone(msg), move, attack };
      })
    );
  };
}
