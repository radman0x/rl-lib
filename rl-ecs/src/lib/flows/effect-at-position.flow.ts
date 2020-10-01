import { selAddToArray } from '@rad/rl-applib';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { of, Subject } from 'rxjs';
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
  const out = {
    start$: new Subject<ActiveEffect & TargetPos>(),
    finish$: new Subject(),
    stateChangeSummaries$: new Subject<Summaries>(),
  };

  const processed = out.start$.pipe(
    take(1),
    map((msg) => entitiesAtPosition(msg, em, 'effectTargetId')),
    mergeMap((msg) => of(...msg)),
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
  processed.subscribe(out.stateChangeSummaries$);
  processed.subscribe(out.finish$);

  return out;
}
