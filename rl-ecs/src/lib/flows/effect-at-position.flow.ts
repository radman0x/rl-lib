import { selAddToArray } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, of, ReplaySubject, Subject } from 'rxjs';
import { map, mergeMap, reduce, share, take } from 'rxjs/operators';
import { EndType } from '../components/end-state.model';
import { entitiesAtPosition } from '../mappers/entities-at-position.system';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ActiveEffectDescription,
  TargetPos,
  WorldStateChangeDescription,
} from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';

export interface Summaries {
  [effectTargetId: string]: (ActiveEffectDescription &
    WorldStateChangeDescription)[];
}
export function effectAtPositionFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (type: EndType) => void
) {
  const start$ = new ReplaySubject<ActiveEffect & TargetPos>();
  const processed = start$.pipe(
    take(1),
    map((msg) => entitiesAtPosition(msg, em, 'effectTargetId')),
    mergeMap((msg) =>
      of(...msg.filter((elem) => isValidId(elem.effectTargetId)))
    ),
    share(),
    mergeMap((msg) => effectPipeline(msg, em, areaResolver, ender)),
    reduce((acc, msg) => {
      if (msg.worldStateChanged === true) {
        selAddToArray(
          acc,
          `${msg.effectTargetId}`,
          _.pick(msg, [
            'activeEffectDescription',
            'worldStateChangeDescription',
          ])
        );
      }
      return acc;
    }, {} as Summaries),
    share()
  );

  return {
    start$,
    stateChangeSummaries$: processed,
    finish$: processed,
  };
}

export function effectAtPositionInstant(
  msg: ActiveEffect & TargetPos,
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (type: EndType) => void
) {
  const flow = effectAtPositionFlow(em, areaResolver, ender);
  const out = new BehaviorSubject(msg);
  out.pipe(take(1)).subscribe(flow.start$);
  return flow;
}
