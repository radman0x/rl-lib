import { selSuggestToArray } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, merge, Observable, of, ReplaySubject } from 'rxjs';
import * as rxjsSpy from 'rxjs-spy';
import { expand, map, mergeMap, reduce, share, take } from 'rxjs/operators';
import { Animation } from '../components/animation.model';
import { EndType } from '../components/end-state.model';
import { GridPosData } from '../components/position.model';
import { entitiesAtPosition } from '../mappers/entities-at-position.system';
import { effectPipeline } from '../operators/effect-pipeline.operator';
import {
  ActiveEffect,
  ChangeReport,
  EffectOrigin,
  SpawnedEffect,
  TargetPos,
} from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';

type Args = ActiveEffect & TargetPos & EffectOrigin;
export interface Summaries {
  [effectTargetId: string]: ChangeReport[];
}
export function effectAtPositionFlow<T extends Args>(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (type: EndType) => void,
  animator: (anim: Animation, pos: GridPosData) => Observable<any>,
  msg?: T // dummy param so that the type gets inferred properly :P
) {
  const start$ = new ReplaySubject<T>();
  const processed = start$.pipe(
    take(1),
    mergeMap((msg) => {
      if (em.hasComponent(msg.effectId, Animation)) {
        const anim = em.getComponent(msg.effectId, Animation);
        return animator(anim, msg.targetPos).pipe(map(() => msg));
      } else {
        return of(msg);
      }
    }),
    map((msg) => entitiesAtPosition(msg, em, 'effectTargetId')),
    mergeMap((msg) =>
      of(...msg.filter((elem) => isValidId(elem.effectTargetId)))
    ),
    share(),
    mergeMap((msg) =>
      effectPipeline(msg, em, areaResolver, ender).pipe(
        expand((msg) => {
          if (msg.effectReport) {
            const temp: SpawnedEffect[] = [].concat(
              Object.values(msg.effectReport)
                .filter((report) => report.spawnedEffects)
                .flatMap((report) => report.spawnedEffects)
            );

            return merge(
              ...temp.map((se) =>
                effectPipeline({ ...se }, em, areaResolver, ender)
              )
            );
          }
          return of();
        }),
        rxjsSpy.operators.tag('useEffect.effectAtPosition')
      )
    ),
    share()
  );

  return {
    start$,
    stateChangeSummaries$: processed.pipe(
      reduce((acc, report) => {
        if (report.effectReport) {
          selSuggestToArray(
            acc,
            `${report.effectTargetId}`,
            report.effectReport
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
  ender: (type: EndType) => void,
  animator: (anim: Animation, pos: GridPosData) => Observable<any>
) {
  const flow = effectAtPositionFlow(em, areaResolver, ender, animator, msg);
  const out = new BehaviorSubject<T>(msg);
  out.pipe(take(1)).subscribe(flow.start$);
  return flow;
}
