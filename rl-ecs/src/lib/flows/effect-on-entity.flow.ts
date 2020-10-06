import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, mergeMap, reduce, take } from 'rxjs/operators';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ActiveEffectDescription,
  EffectTarget,
  WorldStateChanged,
  WorldStateChangeDescription,
} from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';

export type Descriptions = WorldStateChangeDescription &
  ActiveEffectDescription;

export function effectOnEntityFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (EndType) => void
) {
  const out = {
    start$: new Subject<ActiveEffect & EffectTarget>(),
    finish$: new Subject(),
    stateChangeSummary$: new Subject<Descriptions[]>(),
  };

  const internal = {
    processed$: new Subject<
      WorldStateChanged & ActiveEffectDescription & WorldStateChangeDescription
    >(),
  };

  internal.processed$
    .pipe(
      filter((msg) => msg.worldStateChanged === true),
      reduce((acc, curr) => {
        acc = acc || [];
        acc.push(
          _.pick(curr, [
            'activeEffectDescription',
            'worldStateChangeDescription',
          ])
        );
        return acc;
      }, null as Descriptions[] | null),
      filter((summary) => summary !== null),
      map((msg) => {
        console.log(`${JSON.stringify(msg, null, 2)}`);
        return msg;
      })
    )
    .subscribe(out.stateChangeSummary$);

  internal.processed$.pipe(reduce((acc, curr) => curr)).subscribe(out.finish$);

  out.start$
    .pipe(
      take(1),
      mergeMap((msg) => effectPipeline(msg, em, areaResolver, ender))
    )
    .subscribe(internal.processed$);

  return out;
}

export function effectOnEntityFlowInstant(
  em: EntityManager,
  areaResolver: AreaResolver,
  msg: ActiveEffect & EffectTarget,
  ender: (EndType) => void
) {
  const flow = effectOnEntityFlow(em, areaResolver, ender);
  const out = new BehaviorSubject(msg);
  out.pipe(take(1)).subscribe(flow.start$);
  return flow;
}
