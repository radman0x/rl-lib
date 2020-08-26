import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { filter, reduce, take, map } from 'rxjs/operators';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ActiveEffectDescription,
  EffectTarget,
  WorldStateChanged,
  WorldStateChangeDescription
} from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';

export type Descriptions = WorldStateChangeDescription &
  ActiveEffectDescription;

export function effectOnEntityFlow(
  em: EntityManager,
  areaResolver: AreaResolver
) {
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
      map(msg => {
        console.log(JSON.stringify(msg));
        return msg;
      }),
      take(1),
      effectPipeline(em, areaResolver)
    )
    .subscribe(internal.processed$);

  internal.processed$
    .pipe(
      map(msg => {
        console.log(`collecting: ${JSON.stringify(msg)}`);
        return msg;
      }),
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
      ),
      filter(summary => summary !== null)
    )
    .subscribe(out.stateChangeSummary$);

  internal.processed$.pipe(reduce((acc, curr) => curr)).subscribe(out.finish$);

  return out;
}
