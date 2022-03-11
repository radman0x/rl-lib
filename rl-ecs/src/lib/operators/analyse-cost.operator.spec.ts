import { Charges, deductCost, DeductCostArgs } from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable, Subject } from 'rxjs';
import {
  contributeCost,
  ContributeCostEventArgs,
  satisfyCost,
  SatisfyCostEventArgs,
  SatisfyCostOut,
} from './analyse-cost.operator';

describe('Cost analysis', () => {
  describe('Satisfy cost', () => {
    let satisfySubject: Subject<SatisfyCostEventArgs>;
    let em: EntityManager;
    let out: SatisfyCostOut;
    let err: any;
    beforeEach(() => {
      em = new EntityManager();
      em.create(new Charges({ curr: 0, max: 0 })); // make sure component is registered internally in EntityManager
      satisfySubject = new Subject<SatisfyCostEventArgs>();
      satisfySubject.pipe(satisfyCost(em)).subscribe({
        next: (msg) => {
          out = msg;
        },
        error: (e) => (err = e),
      });
    });

    it('should return empty unsatisfied if no payer candidates are present', () => {
      const payerCandidates = [];
      satisfySubject.next({
        payerCandidates,
        cost: { amount: 1, componentType: Charges, property: `curr`, deduct: false, desc: '' },
      });
      expect(out).toMatchObject({ satisfied: false, contributions: [] });
    });

    it('should exactly satisfy cost from a single payer', () => {
      const candidate = em.create(new Charges({ curr: 1, max: 1 })).id;
      const payerCandidates = [candidate];
      satisfySubject.next({
        payerCandidates,
        cost: { amount: 1, componentType: Charges, property: `curr`, deduct: false, desc: '' },
      });
      expect(out).toMatchObject({
        satisfied: true,
        contributions: [{ costPayerId: candidate, contribute: 1 }],
      });
    });

    it('should partially satisfy cost from a single payer', () => {
      const candidate = em.create(new Charges({ curr: 1, max: 1 })).id;
      const payerCandidates = [candidate];
      satisfySubject.next({
        payerCandidates,
        cost: { amount: 2, componentType: Charges, property: `curr`, deduct: false, desc: '' },
      });
      expect(out).toMatchObject({
        satisfied: false,
        contributions: [{ costPayerId: candidate, contribute: 1 }],
      });
    });

    it('should partially satisfy cost from 2 payers', () => {
      const candidate = em.create(new Charges({ curr: 3, max: 3 })).id;
      const candidateB = em.create(new Charges({ curr: 1, max: 1 })).id;
      const payerCandidates = [candidate, candidateB];
      satisfySubject.next({
        payerCandidates,
        cost: { amount: 5, componentType: Charges, property: `curr`, deduct: false, desc: '' },
      });
      expect(out).toMatchObject({
        satisfied: false,
        contributions: [
          { costPayerId: candidate, contribute: 3 },
          { costPayerId: candidateB, contribute: 1 },
        ],
      });
    });

    it('should satisfy cost with leftovers in complex case', () => {
      const candidate = em.create(new Charges({ curr: 3, max: 3 })).id;
      const candidateB = em.create(new Charges({ curr: 1, max: 1 })).id;
      const candidateC = em.create(new Charges({ curr: 2, max: 2 })).id;
      const payerCandidates = [candidate, candidateB, candidateC];
      satisfySubject.next({
        payerCandidates,
        cost: { amount: 5, componentType: Charges, property: `curr`, deduct: false, desc: '' },
      });
      expect(out).toMatchObject({
        satisfied: true,
        contributions: [
          { costPayerId: candidate, contribute: 3 },
          { costPayerId: candidateB, contribute: 1 },
          { costPayerId: candidateC, contribute: 1 },
        ],
      });
    });
  });
  describe('Contribute individual cost', () => {
    let contributeSubject: Subject<ContributeCostEventArgs>;
    let em: EntityManager;
    let costPayerId: EntityId;
    let out: { contribute: number; costPayerId: EntityId };
    let err: any;
    beforeEach(() => {
      em = new EntityManager();
      em.create(new Charges({ curr: 0, max: 0 })); // make sure component is registered internally in EntityManager
      contributeSubject = new Subject<ContributeCostEventArgs>();
      contributeSubject.pipe(contributeCost(em)).subscribe({
        next: (msg) => {
          out = msg;
        },
        error: (e) => (err = e),
      });
    });

    it('should report 0 when no amount is contributed', () => {
      costPayerId = em.create(new Charges({ curr: 0, max: 0 })).id;
      contributeSubject.next({
        cost: { amount: 1, componentType: Charges, property: `curr`, deduct: false, desc: '' },
        costPayerId,
      });
      expect(out).toMatchObject({ contribute: 0, costPayerId });
      expect(err).toBe(undefined);
    });

    it('should report 0 when the cost target component is not present on the payer', () => {
      costPayerId = em.create().id;
      contributeSubject.next({
        cost: { amount: 1, componentType: Charges, property: `curr`, deduct: false, desc: '' },
        costPayerId,
      });
      expect(out).toMatchObject({ contribute: 0, costPayerId });
      expect(err).toBe(undefined);
    });

    it('should report amount available when full amount not contributed', () => {
      costPayerId = em.create(new Charges({ curr: 1, max: 1 })).id;
      contributeSubject.next({
        cost: { amount: 3, componentType: Charges, property: `curr`, deduct: false, desc: '' },
        costPayerId,
      });
      expect(out).toMatchObject({ contribute: 1, costPayerId });
      expect(err).toBe(undefined);
    });

    it('should report a lesser amount when more than needed', () => {
      costPayerId = em.create(new Charges({ curr: 5, max: 5 })).id;
      contributeSubject.next({
        cost: { amount: 3, componentType: Charges, property: `curr`, deduct: false, desc: '' },
        costPayerId,
      });
      expect(out).toMatchObject({ contribute: 3, costPayerId });
      expect(err).toBe(undefined);
    });

    it('should report the exact amount when cost and available match', () => {
      costPayerId = em.create(new Charges({ curr: 3, max: 3 })).id;
      contributeSubject.next({
        cost: { amount: 3, componentType: Charges, property: `curr`, deduct: false, desc: '' },
        costPayerId,
      });
      expect(out).toMatchObject({ contribute: 3, costPayerId });
      expect(err).toBe(undefined);
    });
  });

  describe('Deduct cost', () => {
    let deductSubject: Subject<DeductCostArgs>;
    let em: EntityManager;
    let err: any;
    beforeEach(() => {
      em = new EntityManager();
      em.create(new Charges({ curr: 0, max: 0 })); // make sure component is registered internally in EntityManager
      deductSubject = new Subject<DeductCostArgs>();
      deductSubject.pipe(deductCost(em)).subscribe({
        next: (msg) => {},
        error: (e) => (err = e),
      });
    });

    it('should be a noop if the payer component does not exist', () => {
      const costPayerId = em.create().id;
      deductSubject.next({ costPayerId, componentType: Charges, property: 'curr', amount: 1 });
      expect(err).toBe(undefined);
    });

    it('should do a deduction of less than the total available', () => {
      const costPayerId = em.create(new Charges({ curr: 1, max: 1 })).id;
      deductSubject.next({ costPayerId, componentType: Charges, property: 'curr', amount: 1 });
      expect(em.getComponent(costPayerId, Charges).curr).toEqual(0);
    });
  });
});
