import { EntityId, EntityManager } from 'rad-ecs';
import { Subject, of } from 'rxjs';
import { take, filter, map, reduce } from 'rxjs/operators';
import { produceEffectOutput } from '../operators/produce-effect-output.operator';
import { modifyEffectOutput } from '../operators/modify-effect-output.operator';
import { actionEffectOutput } from '../operators/action-effect-output.operator';
import {
  WorldStateChangeDescription,
  ActiveEffectDescription
} from '../systems.types';

import * as _ from 'lodash';

export type Descriptions = WorldStateChangeDescription &
  ActiveEffectDescription;

export function effectOnEntityFlow(em: EntityManager) {
  const out = {
    start$: new Subject<{ effectId: EntityId; effectTargetId: EntityId }>(),
    finish$: new Subject(),
    stateChangeSummary$: new Subject<Descriptions[]>()
  };

  const internal = {
    processed$: new Subject<
      { worldStateChanged: boolean } & ActiveEffectDescription &
        WorldStateChangeDescription
    >()
  };

  out.start$
    .pipe(
      take(1),
      produceEffectOutput(em),
      modifyEffectOutput(em),
      actionEffectOutput(em)
    )
    .subscribe(internal.processed$);

  internal.processed$
    .pipe(
      filter(msg => msg.worldStateChanged),
      reduce(
        (acc, curr) => {
          acc = acc || [];
          curr;
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

  internal.processed$.subscribe(out.finish$);

  return out;
}
