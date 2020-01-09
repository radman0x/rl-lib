import { acquireEntityPosition } from './acquire-entity-position.system';
import { EntityManager } from 'rad-ecs';
import { GridPos } from '../components/position.model';

describe('Acquire entity position', () => {
  let em: EntityManager;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
  });
  it('should get the a position if the entity is at one', () => {
    const targetsPos = { x: 1, y: 1, z: 1 };
    const targetId = em.createEntity(new GridPos(targetsPos)).id;
    let msg = { protagId: targetId };
    expect(acquireEntityPosition(msg, em).targetPos).toEqual(targetsPos);
  });

  it('should throw an error if the entity is NOT at a position', () => {
    const targetId = em.createEntity().id;
    let msg = { protagId: targetId };
    expect(() => acquireEntityPosition(msg, em).targetPos).toThrow();
  });
});
