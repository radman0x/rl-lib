import { EntityManager } from 'rad-ecs';
import { merge, of, ReplaySubject } from 'rxjs';
import { mergeMap, reduce, share, shareReplay, take } from 'rxjs/operators';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ActiveEffectDescription,
  EffectTarget,
  SpawnedEffect,
  WorldStateChangeDescription,
} from '../systems.types';
import { radClone } from '../systems.utils';
import { AreaResolver } from '../utils/area-resolver.util';

export type Descriptions = WorldStateChangeDescription &
  ActiveEffectDescription;

export function effectOnEntityFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (EndType) => void
) {
  const start$ = new ReplaySubject<ActiveEffect & EffectTarget>();

  return {
    start$,
    finish$: start$.pipe(
      take(1),
      mergeMap((msg) =>
        effectPipeline(
          radClone({ ...msg, effectOrigin: null }),
          em,
          areaResolver,
          ender
        )
      ),
      shareReplay()
    ),
  };
}

export function effectOnEntityFlowInstant(
  em: EntityManager,
  areaResolver: AreaResolver,
  msg: ActiveEffect & EffectTarget,
  ender: (EndType) => void
) {
  const flow = effectOnEntityFlow(em, areaResolver, ender);
  of(msg).subscribe(flow.start$);
  return flow;
}
