import { Consumable, Leverage } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { ConsumableRemove } from '../components/consumable-remove.model';
import { LeverageRemove } from '../components/leverage-remove.model';
import {
  ProcessRemoveEventArgs,
  processRemoveCondition,
  ProcessConditionalRemovalEventArgs,
  processConditionalRemoval,
} from './process-removals.operator';

describe('Process Removals', () => {
  describe('Process remove condition', () => {
    let processRemoveSubject: Subject<ProcessRemoveEventArgs>;
    let em: EntityManager;
    let err: any;
    beforeEach(() => {
      em = new EntityManager();
      em.create(new Consumable({ uses: 0 })), // make sure component is registered internally in EntityManager
        (processRemoveSubject = new Subject<ProcessRemoveEventArgs>());
      processRemoveSubject.pipe(processRemoveCondition(em)).subscribe({
        next: (msg) => {},
        error: (e) => (err = e),
      });
    });

    it('should be a noop if the input entity does not exist', () => {
      const processRemoveId = 777;
      processRemoveSubject.next({
        componentType: Consumable,
        property: 'uses',
        minimum: 1,
        processRemoveId,
      });
      expect(err).toBe(undefined);
    });

    it('should be a noop if no removal condition exists', () => {
      const processRemoveId = em.create().id;
      processRemoveSubject.next({
        componentType: Consumable,
        property: 'uses',
        minimum: 1,
        processRemoveId,
      });
      expect(err).toBe(undefined);
    });

    it('should remove an entity when the component has property below minimum', () => {
      const processRemoveId = em.create(new Consumable({ uses: 0 })).id;
      processRemoveSubject.next({
        componentType: Consumable,
        property: 'uses',
        minimum: 1,
        processRemoveId,
      });
      expect(em.exists(processRemoveId)).toBe(false);
      expect(err).toBe(undefined);
    });

    it('should not remove an entity when the component has property is above or equal', () => {
      const processRemoveId = em.create(new Consumable({ uses: 1 })).id;
      processRemoveSubject.next({
        componentType: Consumable,
        property: 'uses',
        minimum: 1,
        processRemoveId,
      });
      expect(em.exists(processRemoveId)).toBe(true);
      expect(err).toBe(undefined);
    });
  });

  describe('Process removal for entity', () => {
    let processConditionalRemovalSubject: Subject<ProcessConditionalRemovalEventArgs>;
    let em: EntityManager;
    let err: any;
    beforeEach(() => {
      em = new EntityManager();
      em.create(new Consumable({ uses: 0 })), // make sure component is registered internally in EntityManager
        (processConditionalRemovalSubject = new Subject<ProcessConditionalRemovalEventArgs>());
      processConditionalRemovalSubject.pipe(processConditionalRemoval(em)).subscribe({
        next: (msg) => {},
        error: (e) => (err = e),
      });
    });

    it('should be a noop if no remove condition entities remain', () => {
      const processRemovalId = em.create(new Consumable({ uses: 1 })).id;
      processConditionalRemovalSubject.next({ processRemovalId });
      expect(err).toBe(undefined);
      expect(em.exists(processRemovalId)).toEqual(true);
    });

    it('should not remove an entity when uses remain', () => {
      const processRemovalId = em.create(new ConsumableRemove(), new Consumable({ uses: 1 })).id;
      processConditionalRemovalSubject.next({ processRemovalId });
      expect(err).toBe(undefined);
      expect(em.exists(processRemovalId)).toEqual(true);
    });

    it('should remove an entity when 0 uses remain', () => {
      const processRemovalId = em.create(new ConsumableRemove(), new Consumable({ uses: 0 })).id;
      processConditionalRemovalSubject.next({ processRemovalId });
      expect(err).toBe(undefined);
      expect(em.exists(processRemovalId)).toEqual(false);
    });

    it('should not error if two remove conditions exist and would remove the entity', () => {
      const processRemovalId = em.create(
        new ConsumableRemove(),
        new Consumable({ uses: 0 }),
        new LeverageRemove(),
        new Leverage({ power: 0 })
      ).id;
      processConditionalRemovalSubject.next({ processRemovalId });
      expect(err).toBe(undefined);
      expect(em.exists(processRemovalId)).toEqual(false);
    });
  });
});
