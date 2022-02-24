import {
  costPipeline,
  targetingPipeline,
  acquirePositionsPipeline,
  effectAtPositionInstant,
  consequencePipeline,
  removeEntity,
} from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { NEVER, Observable, of } from 'rxjs';
import { filter, map, mapTo, mergeMap, reduce, tap } from 'rxjs/operators';
import { canAffordCost } from '../operators/can-afford-cost.operator';

type EventArgs = {
  effectId: EntityId;
  effectSourceId: EntityId;
  effectDesc: string;
  effectSourceDesc: string;
};

type CreateArgs = {
  em: EntityManager;
};

export function useEffectFlow({ em }: CreateArgs) {
  return <T extends EventArgs>(input: Observable<T>) => {
    const canAfford = (em) => {
      return (msg) => of(msg);
    };
    return input.pipe(canAffordCost({ em, canAfford, cannotAfford: canAfford }));
  };
}
