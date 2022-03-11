import { removeEntity } from '@rad/rl-ecs';
import { Component, ComponentConstructor, EntityId, EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { filter, map, mapTo, mergeMap, tap, toArray } from 'rxjs/operators';
import { RemoveSelfCondition } from '../components/remove-self-condition.model';

export type ProcessRemoveEventArgs = {
  processRemoveId: EntityId;
  componentType: ComponentConstructor;
  property: string;
  minimum: number;
};

export function processRemoveCondition(em: EntityManager) {
  return <T extends ProcessRemoveEventArgs>(input: Observable<T>) => {
    return input.pipe(
      tap((msg) => {
        if (em.exists(msg.processRemoveId)) {
          const targetProperty = em.getComponent(msg.processRemoveId, msg.componentType)?.[
            msg.property
          ];
          if (targetProperty !== undefined && targetProperty < msg.minimum) {
            removeEntity({ entityRemoval: { doRemove: true, removeId: msg.processRemoveId } }, em);
          }
        }
      })
    );
  };
}

export function isRemoveSelfConditionComponent(c: Component): c is RemoveSelfCondition {
  return c instanceof RemoveSelfCondition.prototype.constructor;
}

export type ProcessConditionalRemovalEventArgs = {
  processRemovalId: EntityId;
};

export function processConditionalRemoval(em: EntityManager) {
  return <T extends ProcessConditionalRemovalEventArgs>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((origMsg) => {
        if (!em.exists(origMsg.processRemovalId)) {
          return of(origMsg);
        }
        const components = em
          .get(origMsg.processRemovalId)
          .allComponents()
          .map((e) => e.component);
        return of(...components).pipe(
          map((component) => {
            if (isRemoveSelfConditionComponent(component)) {
              return { processRemoveId: origMsg.processRemovalId, ...component };
            } else {
              return null;
            }
          }),
          filter((msg) => msg !== null),
          processRemoveCondition(em),
          toArray(),
          mapTo(origMsg)
        );
      })
    );
  };
}
