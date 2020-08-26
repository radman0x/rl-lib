import { EntityManager, EntityId } from 'rad-ecs';
import { Subject, of, BehaviorSubject } from 'rxjs';
import { GridPosData } from '../components/position.model';
import { effectOnEntityFlow, Descriptions } from './effect-on-entity.flow';
import { entitiesAtPosition } from '../mappers/entities-at-position.system';
import {
  map,
  mergeMap,
  switchMap,
  take,
  reduce,
  filter,
  tap,
  multicast,
  publish,
  share
} from 'rxjs/operators';
import {
  ActiveEffect,
  TargetPos,
  ActiveEffectDescription,
  WorldStateChangeDescription
} from '../systems.types';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import * as _ from 'lodash';
import { selAddToArray } from '@rad/rl-applib';
import { AreaResolver } from '../utils/area-resolver.util';

export interface Summaries {
  [effectTargetId: string]: (ActiveEffectDescription &
    WorldStateChangeDescription)[];
}
export function effectAtPositionFlow(
  em: EntityManager,
  areaResolver: AreaResolver
) {
  const out = {
    start$: new Subject<ActiveEffect & TargetPos>(),
    finish$: new Subject(),
    stateChangeSummaries$: new Subject<Summaries>()
  };

  const processed = out.start$.pipe(
    take(1),
    map(msg => entitiesAtPosition(msg, em, 'effectTargetId')),
    mergeMap(msg => of(...msg)),
    share(),
    effectPipeline(em, areaResolver),
    reduce(
      (acc, msg) => {
        if (msg.worldStateChanged === true) {
          selAddToArray(
            acc,
            `${msg.effectTargetId}`,
            _.pick(msg, [
              'activeEffectDescription',
              'worldStateChangeDescription'
            ])
          );
        }
        return acc;
      },
      {} as Summaries
    ),
    share()
  );
  processed.subscribe(out.stateChangeSummaries$);
  processed.subscribe(out.finish$);

  return out;
}
