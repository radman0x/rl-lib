import { isCostComponent } from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { filter, map, mapTo, mergeMap, scan, tap, toArray } from 'rxjs/operators';

export type CostDetails = {
  componentType: string;
  property: string;
  amount: number;
  deduct: boolean;
};

export type ContributeCostEventArgs = {
  cost: CostDetails;
  costPayerId: EntityId;
};

export function contributeCost(em: EntityManager) {
  return <T extends ContributeCostEventArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        const { cost, costPayerId } = msg;
        const costComponent = em.getComponentByName(costPayerId, cost.componentType);
        if (costComponent) {
          const costProperty = costComponent[cost.property];
          if (costProperty >= cost.amount) {
            return { contribute: cost.amount, costPayerId };
          } else {
            return { contribute: costProperty as number, costPayerId };
          }
        }
        return { contribute: 0, costPayerId };
      })
    );
  };
}

export type Contribution = { costPayerId: EntityId; contribute: number };
export type SatisfyCostEventArgs = {
  cost: CostDetails;
  payerCandidates: EntityId[];
};

export type SatisfyCostOut = {
  satisfied: boolean;
  contributions: Contribution[];
};

export function satisfyCost(em: EntityManager) {
  return <T extends SatisfyCostEventArgs>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((msg) =>
        of(
          ...msg.payerCandidates.map((costPayerId) => ({
            ...msg,
            payerCandidates: undefined,
            costPayerId,
          }))
        ).pipe(
          contributeCost(em),
          toArray(),
          map((contributions) => {
            let amountCounter = msg.cost.amount;
            const out: SatisfyCostOut = {
              satisfied: false,
              contributions: [],
            };
            for (const contrib of contributions) {
              if (contrib.contribute === 0) {
                continue;
              } else if (contrib.contribute < amountCounter) {
                out.contributions.push(contrib);
                amountCounter -= contrib.contribute;
              } else if (contrib.contribute >= amountCounter) {
                const needed = Math.min(amountCounter, contrib.contribute);
                out.contributions.push({ costPayerId: contrib.costPayerId, contribute: needed });
                out.satisfied = true;
                break;
              }
            }
            return out;
          })
        )
      )
    );
  };
}

export type SatisfyAllCostsEventArgs = {
  costs: CostDetails[];
  payerCandidates: EntityId[];
};

export type CostContribution = {
  componentType: string;
  property: string;
  amount: number;
  deduct: boolean;
  satisfied: boolean;
  contributions: Contribution[];
};
export type CostAnalysis = {
  costAnalysis: {
    allSatisfied: boolean;
    details: CostContribution[];
  };
};

export function satisfyAllCosts(em: EntityManager) {
  return <T extends SatisfyAllCostsEventArgs>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((inputMsg) =>
        of(...inputMsg.costs.map((c) => ({ ...inputMsg, costs: undefined, cost: c }))).pipe(
          mergeMap((pre) =>
            of(pre).pipe(
              satisfyCost(em),
              map((satisfied) => ({
                ...satisfied,
                componentType: pre.cost.componentType,
                property: pre.cost.property,
                deduct: pre.cost.deduct,
                amount: pre.cost.amount,
              }))
            )
          ),
          toArray(),
          map((msg) => {
            const allSatisfied = msg.every((entry) => entry.satisfied);
            return { ...inputMsg, costAnalysis: { allSatisfied, details: msg } } as CostAnalysis &
              T;
          })
        )
      )
    );
  };
}

export type DeductCostArgs = {
  componentType: string;
  property: string;
  amount: number;
  costPayerId: EntityId;
};

export function deductCost(em: EntityManager) {
  return <T extends DeductCostArgs>(input: Observable<T>) => {
    return input.pipe(
      tap((msg) => {
        const payerComponent = em.getComponentByName(msg.costPayerId, msg.componentType);
        if (payerComponent) {
          const curr: number = payerComponent[msg.property];
          payerComponent[msg.property] = curr - msg.amount;
          em.setComponentByName(msg.costPayerId, msg.componentType, payerComponent);
        }
      })
    );
  };
}

export function deductAllCosts(em: EntityManager) {
  return <T extends CostAnalysis>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((origMsg) =>
        of(...origMsg.costAnalysis.details).pipe(
          mergeMap((analysisDetails) =>
            of(...analysisDetails.contributions).pipe(
              filter(() => analysisDetails.deduct),
              map((contribution) => ({
                componentType: analysisDetails.componentType,
                property: analysisDetails.property,
                costPayerId: contribution.costPayerId,
                amount: contribution.contribute,
              })),
              deductCost(em)
            )
          ),
          toArray(), // force an empty array on complete
          mapTo(origMsg) // so that we can always output the input message
        )
      )
    );
  };
}
