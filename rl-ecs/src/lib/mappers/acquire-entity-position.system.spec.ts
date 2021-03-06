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
    const targetId = em.create(new GridPos(targetsPos)).id;
    let msg = { protagId: targetId };
    expect(acquireEntityPosition(msg, em).targetPos).toEqual(targetsPos);
  });

  it('should provide null if the provided entity is not at a position', () => {
    const targetId = em.create().id;
    let msg = { protagId: targetId };
    expect(acquireEntityPosition(msg, em).targetPos).toEqual(null);
  });
});
