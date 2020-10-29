import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, Subject } from 'rxjs';
import { mergeMap, reduce, take } from 'rxjs/operators';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ActiveEffectDescription,
  EffectReport,
  EffectTarget,
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
    stateChangeSummary$: new Subject<EffectReport>(),
  };

  const internal = {
    processed$: new Subject<EffectReport>(),
  };

  internal.processed$.subscribe(out.stateChangeSummary$);
  internal.processed$.subscribe(out.finish$);

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
