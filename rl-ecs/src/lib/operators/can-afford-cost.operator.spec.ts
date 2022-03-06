import { Charges, Consumable, Cooldown, Effects, EnergyCost, MemberOf } from '@rad/rl-ecs';
import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';
import { canAffordCost } from './can-afford-cost.operator';

function mockObs(value: any) {
  const bodyFn = jest.fn();
  const operatorFn = jest.fn((input: Observable<any>) => {
    return input.pipe(
      tap(() => bodyFn()),
      mapTo(value)
    );
  });
  const factoryFn = jest.fn(() => {
    return operatorFn;
  });
  return { operatorFn, factoryFn, bodyFn };
}

describe('Can afford cost', () => {
  let em: EntityManager;
  let effectId: EntityId;
  let effectSourceId: EntityId;

  beforeEach(() => {
    em = new EntityManager();

    effectId = em.create(new EnergyCost({ amount: 1 })).id;
    effectSourceId = em.create(new Effects({ contents: [effectId] })).id;

    em.setComponent(
      effectId,
      new MemberOf({ component: Effects, id: effectSourceId, property: 'contents' })
    );
  });

  it('should choose cannot afford when cost is present but not satisfied', () => {
    const data = {
      effectId,
      effectSourceId,
    };
    const canAfford = mockObs(null);
    const cannotAfford = mockObs(null);
    of(data)
      .pipe(
        canAffordCost({
          em,
          canAfford: canAfford.factoryFn,
          cannotAfford: cannotAfford.factoryFn,
        })
      )
      .subscribe();
    expect(canAfford.bodyFn).not.toHaveBeenCalled();
    expect(cannotAfford.bodyFn).toHaveBeenCalled();
  });

  it('should fail when charges are present but not sufficient', () => {
    em.setComponent(effectSourceId, new Charges({ curr: 0, max: 1 }));
    const data = {
      effectId,
      effectSourceId,
    };
    const canAfford = mockObs(null);
    const cannotAfford = mockObs(null);
    of(data)
      .pipe(
        canAffordCost({
          em,
          canAfford: canAfford.factoryFn,
          cannotAfford: cannotAfford.factoryFn,
        })
      )
      .subscribe();
    expect(canAfford.bodyFn).not.toHaveBeenCalled();
    expect(cannotAfford.bodyFn).toHaveBeenCalled();
  });
  it('Can afford cost with charges', () => {
    em.setComponent(effectSourceId, new Charges({ curr: 1, max: 1 }));
    const data = {
      effectId: 1,
      effectSourceId: 2,
    };
    const canAfford = mockObs(null);
    const cannotAfford = mockObs(null);
    of(data)
      .pipe(
        canAffordCost({
          em,
          canAfford: canAfford.factoryFn,
          cannotAfford: cannotAfford.factoryFn,
        })
      )
      .subscribe();
    expect(canAfford.bodyFn).toHaveBeenCalled();
    expect(cannotAfford.bodyFn).not.toHaveBeenCalled();
  });
  it('Can afford cost with use', () => {
    em.setComponent(effectSourceId, new Consumable({ uses: 1 }));
    const data = {
      effectId: 1,
      effectSourceId: 2,
    };
    const canAfford = mockObs(null);
    const cannotAfford = mockObs(null);
    of(data)
      .pipe(
        canAffordCost({
          em,
          canAfford: canAfford.factoryFn,
          cannotAfford: cannotAfford.factoryFn,
        })
      )
      .subscribe();
    expect(canAfford.bodyFn).toHaveBeenCalled();
    expect(cannotAfford.bodyFn).not.toHaveBeenCalled();
  });

  it('Can afford cost with cooldown', () => {
    em.setComponent(effectSourceId, new Cooldown({ curr: 0 }));
    const data = {
      effectId: 1,
      effectSourceId: 2,
    };
    const canAfford = mockObs(null);
    const cannotAfford = mockObs(null);
    of(data)
      .pipe(
        canAffordCost({
          em,
          canAfford: canAfford.factoryFn,
          cannotAfford: cannotAfford.factoryFn,
        })
      )
      .subscribe();
    expect(canAfford.bodyFn).toHaveBeenCalled();
    expect(cannotAfford.bodyFn).not.toHaveBeenCalled();
  });
});
