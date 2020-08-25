import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { filter, reduce, take } from 'rxjs/operators';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ActiveEffectDescription,
  EffectTarget,
  WorldStateChanged,
  WorldStateChangeDescription
} from '../systems.types';

export type Descriptions = WorldStateChangeDescription &
  ActiveEffectDescription;

export function effectOnEntityFlow(em: EntityManager) {
  const out = {
    start$: new Subject<ActiveEffect & EffectTarget>(),
    finish$: new Subject(),
    stateChangeSummary$: new Subject<Descriptions[]>()
  };

  const internal = {
    processed$: new Subject<
      WorldStateChanged & ActiveEffectDescription & WorldStateChangeDescription
    >()
  };

  out.start$
    .pipe(
      take(1),
      effectPipeline(em)
    )
    .subscribe(internal.processed$);

  internal.processed$
    .pipe(
      filter(msg => msg.worldStateChanged === true),
      reduce(
        (acc, curr) => {
          acc = acc || [];
          acc.push(
            _.pick(curr, [
              'activeEffectDescription',
              'worldStateChangeDescription'
            ])
          );
          return acc;
        },
        null as Descriptions[] | null
      )
    )
    .subscribe(out.stateChangeSummary$);

  internal.processed$.pipe(reduce((acc, curr) => curr)).subscribe(out.finish$);

  return out;
}
