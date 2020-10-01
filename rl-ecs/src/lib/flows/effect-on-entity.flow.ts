import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, mergeMap, reduce, take } from 'rxjs/operators';
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
  msg: ActiveEffect & EffectTarget,
  ender: (EndType) => void
) {
  const out = {
    finish$: new Subject(),
    stateChangeSummary$: new Subject<Descriptions[]>(),
  };

  const internal = {
    start$: new BehaviorSubject<ActiveEffect & EffectTarget>(msg),
    processed$: new Subject<
      WorldStateChanged & ActiveEffectDescription & WorldStateChangeDescription
    >(),
  };

  internal.start$
    .pipe(
      take(1),
      mergeMap((msg) => effectPipeline(msg, em, areaResolver, ender))
    )
    .subscribe(internal.processed$);

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
      filter((summary) => summary !== null)
    )
    .subscribe(out.stateChangeSummary$);

  internal.processed$.pipe(reduce((acc, curr) => curr)).subscribe(out.finish$);

  return out;
}
