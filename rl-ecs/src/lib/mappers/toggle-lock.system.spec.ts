import { EntityManager, EntityId } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { toggleLock } from './toggle-lock.system';
import { ToggleLock } from '../components/toggle-lock.model';

describe('Toggle lock output creator', () => {
  let em: EntityManager;
  let msg: any;
  let effectId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    effectId = em.create(new ToggleLock({ lockId: 'A' })).id;
    msg = { effectId };
  });

  it('should do nothing if a ToggleLock component is not present', () => {
    em.removeComponent(effectId, ToggleLock);
    const out = toggleLock(msg, em);
    expect(out).toStrictEqual(msg);
  });

  it('should add appropriate data if a ToggleLock component is present', () => {
    const out = toggleLock(msg, em);
    expect(out).toMatchObject({ effectId, lockChange: { lockId: 'A' } });
  });
});
