import { EntityManager } from 'rad-ecs';
import { CountdownTimer } from '../components/coundown-timer.model';
import { RemoveSelf } from '../components/remove-self.model';
import { AreaResolver } from '../utils/area-resolver.util';
import { globalTurnActionsFlowInstant } from './global-turn-actions.flow';

describe('Global turn actions', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;

  beforeEach(() => {
    em = new EntityManager();
    areaResolver = new AreaResolver();
  });

  it('should provide a null event and complete correctly when there is nothing in the entity manager to work on', () => {
    const globalTurn = globalTurnActionsFlowInstant(
      em,
      areaResolver,
      () => null
    );
    let message = false;
    let complete = false;
    globalTurn.subscribe({
      next: (msg) => (message = msg),
      complete: () => (complete = true),
    });
    expect(message).toEqual(null);
    expect(complete).toBe(true);
  });

  it.only('should action a trigger and perform an effect correctly', () => {
    const timerId = em.create(
      new CountdownTimer({ current: 1, max: 1 }),
      new RemoveSelf({})
    ).id;
    const globalTurn = globalTurnActionsFlowInstant(
      em,
      areaResolver,
      () => null
    );
    let message = false;
    let complete = false;
    globalTurn.subscribe({
      next: (msg) => (message = msg),
      complete: () => (complete = true),
    });
    expect(message).toEqual(null);
    expect(complete).toBe(true);

    expect(em.exists(timerId)).toBe(false);
  });
});
