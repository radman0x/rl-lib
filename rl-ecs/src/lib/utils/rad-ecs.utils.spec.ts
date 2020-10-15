import {
  AdjustType,
  Mental,
  MentalState,
  Modifier,
  StatusEffects,
} from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { getModifiedComponent } from './rad-ecs.utils';

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
});
