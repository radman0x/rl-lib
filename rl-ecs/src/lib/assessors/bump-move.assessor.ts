import { CompassDirection } from '@rad/rl-utils';
import * as _ from 'lodash';
import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DamageData } from '../components/damage.model';
import { positionNextToEntity } from '../mappers/position-next-to-entity.system';
import { gatherBumpInfo } from '../operators/gather-bump-info.operator';
import { resolveBump } from '../operators/resolve-bump.operator';
import { MoveOrder, MovingEntity } from '../systems.types';
import { radClone } from '../systems.utils';
import { assessBumpMove } from '../operators/bump-move.operator';

export interface BumpMoveAssessment {
  move: MoveOrder | null;
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
      assessBumpMove(em, rand)
    )
    .subscribe(out.finish$);

  return out;
}
