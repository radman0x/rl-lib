import { EntityManager } from 'rad-ecs';
import { Effects } from '../components/effects.model';
import { MemberOf } from '../components/member-of.model';
import { GridPos } from '../components/position.model';
import { Targeted } from '../components/targeted.model';
import {
  findComponentInEntityChain,
  recursiveObserveEntity,
} from './rad-ecs.utils';

describe('Rad ecs utils', () => {
  describe('Find parent in entity chain with component', () => {
    let em: EntityManager;
    beforeEach(() => {
      em = new EntityManager();
    });

    it('should throw if the input id at the root is invalid', () => {
      expect(() => findComponentInEntityChain(em, 5, GridPos)).toThrow();
    });
    it('should return null if the component does not exist on a single entity', () => {
      const id = em.create().id;
      expect(findComponentInEntityChain(em, id, GridPos)).toBe(null);
    });
    it('should return null if the component does not exist on an entity with a parent', () => {
      const parent = em.create().id;
      const child = em.create(
        new MemberOf({ id: parent, component: Effects, property: 'contents' })
      ).id;
      expect(findComponentInEntityChain(em, child, GridPos)).toBe(null);
    });

    it('should return the id of the entity if a single entity has the desired component', () => {
      const id = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
      expect(findComponentInEntityChain(em, id, GridPos)).toBe(id);
    });

    it('should return the id of the parent entity if that has the desired component', () => {
      const parent = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
      const child = em.create(
        new MemberOf({ id: parent, component: Effects, property: 'contents' })
      ).id;
      expect(findComponentInEntityChain(em, child, GridPos)).toBe(parent);
    });

    it('should return the id of the child if both the parent and the child have the desired component', () => {
      const parent = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
      const child = em.create(
        new MemberOf({ id: parent, component: Effects, property: 'contents' }),
        new GridPos({ x: 1, y: 1, z: 1 })
      ).id;
      expect(findComponentInEntityChain(em, child, GridPos)).toBe(child);
    });
  });

  describe('Recursive observe entity', () => {
    let em: EntityManager;
    beforeEach(() => {
      em = new EntityManager();
    });

    it('should observe a change to a single entity', () => {
      const id = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
      let updated = false;
      recursiveObserveEntity(id, em).subscribe(() => (updated = true));
      em.setComponent(id, new GridPos({ x: 0, y: 0, z: 0 }));
      expect(updated).toBe(true);
    });

    it('should observe a change in a child effect entity', () => {
      const effectId = em.create(new Targeted({ range: 5 })).id;
      const id = em.create(new Effects({ contents: [effectId] })).id;
      let updated = false;
      recursiveObserveEntity(id, em).subscribe(() => (updated = true));
      em.setComponent(effectId, new Targeted({ range: 7 }));
      expect(updated).toBe(true);
    });
  });
});
