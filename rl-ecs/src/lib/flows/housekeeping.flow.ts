import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, merge, of, Subject } from 'rxjs';
import { filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { updateBlockageState } from '../actioners/update-blockage.state.actioner';
import { Blockage } from '../components/blockage.model';
import { EndType } from '../components/end-state.model';
import { NonePresent } from '../components/none-present.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import { addProperty, radClone } from '../systems.utils';
import { AreaResolver } from '../utils/area-resolver.util';
import { effectOnEntityFlowInstant } from './effect-on-entity.flow';

export function housekeepingFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (endType: EndType) => void
) {
  const start$ = new Subject<null>();

  start$.pipe(tap(() => console.log(`Housekeeping!`)));

  const updateBlockages = start$.pipe(
    take(1),
    map(() => addProperty({}, 'componentTypes', [Blockage])),
    mergeMap((msg) => of(...entitiesWithComponents(msg, em, 'blockageId'))),
    tap((msg) => updateBlockageState(msg, em))
  );

  const nonePresentCondition = start$.pipe(
    take(1),
    map(() => ({ componentTypes: [NonePresent] })),
    mergeMap((msg) => of(...entitiesWithComponents(msg, em, 'conditionId'))),
    filter((msg) => {
      let nonePresent = true;
      for (const id of em.getComponent(msg.conditionId, NonePresent).entities) {
        if (em.exists(id)) {
          nonePresent = false;
          break;
        }
      }
      return nonePresent;
    }),
    map((msg) => ({
      ...radClone(msg),
      effectId: msg.conditionId,
      effectTargetId: null,
    })),
    mergeMap(
      (msg) =>
        effectOnEntityFlowInstant(em, areaResolver, msg, ender)
          .stateChangeSummary$
    )
  );

  const finish$ = new Subject();
  merge(updateBlockages, nonePresentCondition).subscribe(finish$);
  return {
    start$,
    finish$,
  };
}
export function housekeepingFlowInstant(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (endType: EndType) => void
) {
  const flow = housekeepingFlow(em, areaResolver, ender);
  new BehaviorSubject(null).pipe(take(1)).subscribe(flow.start$);
  return { finish$: flow.finish$ };
}
