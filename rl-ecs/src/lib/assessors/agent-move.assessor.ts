import { EntityManager } from 'rad-ecs';
import { Subject, of } from 'rxjs';
import { ActiveAgent } from '../systems.types';
import { BumpMoveAssessment } from './bump-move.assessor';
import { gatherBumpInfo } from '../operators/gather-bump-info.operator';
import { resolveBump } from '../operators/resolve-bump.operator';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { Mobile } from '../components/mobile.model';
import { xyPositionsAround } from '@rad/rl-utils';
import { GridPos } from '../components/position.model';
import { radClone, addProperty } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import * as _ from 'lodash';
import { assessBumpMove } from '../operators/bump-move.operator';

export function agentMoveAssessor(em: EntityManager, rand: Chance.Chance) {
  const out = {
    start$: new Subject<ActiveAgent>(),
    finish$: new Subject<Id<BumpMoveAssessment>>()
  };

  out.start$
    .pipe(
      map(msg => {
        const mobile = em.getComponent(msg.agentId, Mobile);
        return msg;
      }),
      mergeMap(msg => {
        return of(
          ...xyPositionsAround(em.getComponent(msg.agentId, GridPos)).map(
            pos => ({ ...radClone(msg), movingId: msg.agentId, targetPos: pos })
          )
        );
      }),
      assessBumpMove(em, rand)
    )
    .subscribe(out.finish$);

  return out;

  // locate movement component on agent
  // produce message for each candidate position
  // produce assessment for each candidate
  // reduce down so only the valid moves are left
  // final message contains array of possible orders
}
