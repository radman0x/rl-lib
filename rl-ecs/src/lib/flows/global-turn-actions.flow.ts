import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import * as rxjsSpy from 'rxjs-spy';
import { filter, map, mergeMap, reduce, take, tap } from 'rxjs/operators';
import { Cooldown } from '../components/cooldown.model';
import { CountdownTimer } from '../components/coundown-timer.model';
import { EndType } from '../components/end-state.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import { radClone } from '../systems.utils';
import { AreaResolver } from '../utils/area-resolver.util';
import { effectOnEntityFlowInstant } from './effect-on-entity.flow';

export function globalTurnActionsFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (endType: EndType) => void
) {
  const start$ = new ReplaySubject<null>(1);

  const countdownTimer = start$.pipe(
    take(1),
    rxjsSpy.operators.tag('turnEnd.globalTurnActions.start'),
    mergeMap(() =>
      of({ componentTypes: [CountdownTimer] }).pipe(
        mergeMap((msg) => of(...entitiesWithComponents(msg, em, 'timerId'))),
        filter((msg) => isValidId(msg.timerId)),
        tap((msg) => {
          const timer = em.getComponent(msg.timerId, CountdownTimer);
          em.setComponent(
            msg.timerId,
            new CountdownTimer({ ...timer, current: timer.current - 1 })
          );
        }),
        filter(
          (msg) => em.getComponent(msg.timerId, CountdownTimer).current <= 0
        ),
        map((msg) => ({
          ...radClone(msg),
          effectId: msg.timerId,
          effectTargetId: null,
        })),
        mergeMap(
          (msg) =>
            effectOnEntityFlowInstant(em, areaResolver, msg, ender).finish$
        ),
        reduce((acc, curr) => acc, null)
      )
    ),
    mergeMap(() =>
      of({ componentTypes: [Cooldown] }).pipe(
        mergeMap((msg) => of(...entitiesWithComponents(msg, em, 'cooldownId'))),
        filter(
          (msg) =>
            isValidId(msg.cooldownId) &&
            em.getComponent(msg.cooldownId, Cooldown).curr !== 0
        ),
        tap((msg) => {
          const cooldown = em.getComponent(msg.cooldownId, Cooldown);
          em.setComponent(
            msg.cooldownId,
            new Cooldown({ ...cooldown, curr: cooldown.curr - 1 })
          );
        })
      )
    )
  );

  return {
    start$,
    finish$: merge(countdownTimer).pipe(
      reduce((acc, curr) => null, null),
      rxjsSpy.operators.tag('turnEnd.globalTurnActions.end')
    ),
  };
}

export function globalTurnActionsFlowInstant(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (endType: EndType) => void
) {
  const flow = globalTurnActionsFlow(em, areaResolver, ender);
  new BehaviorSubject(null).pipe(take(1)).subscribe(flow.start$);
  return flow.finish$;
}
