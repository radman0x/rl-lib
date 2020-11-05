import {
  AdjustType,
  Mental,
  MentalState,
  Modifier,
  StatusEffects,
} from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { Effects } from '../components/effects.model';
import { MemberOf } from '../components/member-of.model';
import { GridPos } from '../components/position.model';
import {
  findComponentInEntityChain,
  getModifiedComponent,
} from './rad-ecs.utils';

describe('Rad ecs utils', () => {
  describe('Adjust component for modifiers', () => {
    let em: EntityManager;
    let id: EntityId;
    beforeEach(() => {
      em = new EntityManager();
      id = em.create().id;
    });

    it('should just retrieve an unmodified component if no modifiers exist', () => {
      const componentContents = { state: MentalState.NORMAL };
      em.setComponent(id, new Mental(componentContents));
      expect(getModifiedComponent(em, id, Mental)).toEqual(componentContents);
    });

    it('should return null if the component does not exist on the provided entity', () => {
      expect(getModifiedComponent(em, id, Mental)).toEqual(null);
    });

    it('should return a modified Mental component', () => {
      em.setComponent(id, new Mental({ state: MentalState.NORMAL }));
      const statusEffects = new StatusEffects({
        list: [
          em.create(
            new Modifier({
              entries: [
                {
                  type: Mental,
                  property: 'state',
                  adjustType: AdjustType.REPLACE,
                  adjustValue: MentalState.STUNNED,
                },
              ],
            })
          ).id,
        ],
      });
      em.setComponent(id, statusEffects);
      const modified = getModifiedComponent(em, id, Mental);
      expect(em.getComponent(id, Mental)).toEqual({
        state: MentalState.NORMAL,
      });
      expect(modified).toEqual({
        state: MentalState.STUNNED,
      });
    });
  });

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
});
