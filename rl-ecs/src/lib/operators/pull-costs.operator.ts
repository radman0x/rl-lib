import { ComponentCost } from '@rad/rl-ecs';
import { Component, EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CostDetails } from './analyse-cost.operator';

export type PullCostsEventArgs = {
  costSourceId: EntityId;
};

export type Costs = (CostDetails & { deduct: boolean })[];

export function isCostComponent(c: Component): c is ComponentCost {
  return c instanceof ComponentCost.prototype.constructor;
}

export function pullCosts(em: EntityManager) {
  return <T extends PullCostsEventArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        const components = em
          .get(msg.costSourceId)
          .allComponents()
          .map((e) => e.component);
        const out: Costs = [];
        for (const component of components) {
          if (isCostComponent(component)) {
            out.push({ ...component, deduct: component.consume, desc: component.name });
          }
        }
        return { ...msg, costs: out };
      })
    );
  };
}
