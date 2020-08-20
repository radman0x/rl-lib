import { CompassDirection } from '@rad/rl-utils';
import * as _ from 'lodash';
import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DamageData } from '../components/damage.model';
import { GridPosData } from '../components/position.model';
import { positionNextToEntity } from '../mappers/position-next-to-entity.system';
import { gatherBumpInfo } from '../operators/gather-bump-info.operator';
import { resolveBump } from '../operators/resolve-bump.operator';
import { MovingEntity } from '../systems.types';
import { radClone } from '../systems.utils';

export interface BumpMoveAssessment {
  move: { movingId: EntityId; newPos: GridPosData } | null;
  attack: {
    combatTargetId: EntityId;
    aggressorId: EntityId;
    strikeSuccess: boolean;
    woundSuccess: boolean;
    damage: DamageData | null;
  } | null;
}

export function bumpMoveAssessor(em: EntityManager, rand: Chance.Chance) {
  const out = {
    start$: new Subject<MovingEntity & { direction: CompassDirection }>(),
    finish$: new Subject<BumpMoveAssessment>()
  };

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
      gatherBumpInfo(em),
      resolveBump(em, rand),
      map(msg => {
        let move = null;
        let attack = null;
        if (msg.spatial) {
          move = radClone(msg.spatial);
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

        return { move, attack };
      })
    )
    .subscribe(out.finish$);

  return out;
}
