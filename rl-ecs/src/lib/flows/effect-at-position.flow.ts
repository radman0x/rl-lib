import { selAddToArray } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { map, mergeMap, reduce, share, take } from 'rxjs/operators';
import { EndType } from '../components/end-state.model';
import { entitiesAtPosition } from '../mappers/entities-at-position.system';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ActiveEffectDescription,
  ChangeReport,
  EffectReport,
  TargetPos,
  WorldStateChangeDescription,
} from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';

type Args = ActiveEffect & TargetPos;
export interface Summaries {
  [effectTargetId: string]: ChangeReport;
}
export function effectAtPositionFlow<T extends Args>(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (type: EndType) => void,
  msg?: T // dummy param so that the type gets inferred properly :P
) {
  const start$ = new ReplaySubject<T>();
  const processed = start$.pipe(
    take(1),
    map((msg) => entitiesAtPosition(msg, em, 'effectTargetId')),
    mergeMap((msg) =>
      of(...msg.filter((elem) => isValidId(elem.effectTargetId)))
    ),
    share(),
    mergeMap((msg) => effectPipeline(msg, em, areaResolver, ender)),
    share()
  );

  return {
    start$,
    stateChangeSummaries$: processed.pipe(
      reduce((acc, msg) => {
        if (msg.effectReport) {
          acc[msg.effectTargetId] = msg.effectReport;
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
