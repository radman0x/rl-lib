import { ComponentCost, Inventory } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { LeverageCost } from '../components/leverage-cost.model';
import { Strength } from '../components/strength.model';
import { pullCosts, PullCostsEventArgs, Costs } from './pull-costs.operator';

describe('Pull costs', () => {
  let satisfySubject: Subject<PullCostsEventArgs>;
  let em: EntityManager;
  let out: any;
  let err: any;
  beforeEach(() => {
    em = new EntityManager();
    satisfySubject = new Subject<PullCostsEventArgs>();
    satisfySubject.pipe(pullCosts(em)).subscribe({
      next: (msg) => {
        out = msg;
      },
      error: (e) => (err = e),
    });
  });

  it('should return an empty array if no components exist on the target entity', () => {
    const costSourceId = em.create().id;
    satisfySubject.next({ costSourceId });
    expect(out).toEqual({ costSourceId, costs: [] });
  });

  it('should return an empty array if no cost components exist on the target entity', () => {
    const costSourceId = em.create(new Strength({ count: 7 }), new Inventory({ contents: [] })).id;
    satisfySubject.next({ costSourceId });
    expect(out).toEqual({ costSourceId, costs: [] });
  });

  it('should correctly detect a base cost component', () => {
    const costDetails = { componentType: 'Strength', property: 'count', amount: 5, consume: true };
    const costSourceId = em.create(new ComponentCost(costDetails)).id;
    satisfySubject.next({ costSourceId });
    expect(out).toEqual({ costSourceId, costs: [{ ...costDetails, deduct: costDetails.consume }] });
  });

  it('should correctly detect a derived cost component', () => {
    const costSourceId = em.create(new LeverageCost({ amount: 5 })).id;
    satisfySubject.next({ costSourceId });
    expect(out).toEqual({
      costSourceId,
      costs: [
        {
          componentType: 'Leverage',
          property: 'power',
          amount: 5,
          deduct: false,
          consume: false,
        },
      ],
    });
  });
});
