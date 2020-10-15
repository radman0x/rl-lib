import { selAddToArray } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
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

type Args = ActiveEffect & TargetPos;
export interface Summaries {
  [effectTargetId: string]: (ActiveEffectDescription &
    WorldStateChangeDescription)[];
}
export function effectAtPositionFlow<T extends Args>(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (type: EndType) => void,
  msg: T // dummy param so that type gets inferred properly :P
) {
  const start$ = new ReplaySubject<T>();
  const processed = start$.pipe(
    take(1),
    map((msg) => entitiesAtPosition(msg, em, 'effectTargetId')),
    mergeMap((msg) =>
      of(...msg.filter((elem) => isValidId(elem.effectTargetId)))
    ),
    share(),
    mergeMap((msg) => effectPipeline(msg, em, areaResolver, ender))
  );

  return {
    start$,
    stateChangeSummaries$: processed.pipe(
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
    ),
    finish$: processed,
  };
}

export function effectAtPositionInstant<T extends Args>(
  msg: T,
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (type: EndType) => void
) {
  const flow = effectAtPositionFlow(em, areaResolver, ender, msg);
  const out = new BehaviorSubject<T>(msg);
  out.pipe(take(1)).subscribe(flow.start$);
  return flow;
}
