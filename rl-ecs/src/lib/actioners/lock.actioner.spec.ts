import { EntityManager, EntityId } from 'rad-ecs';
import { Lock, LockState } from '../components/lock.model';
import { lock } from './lock.actioner';
import { Renderable } from '../components/renderable.model';

describe('Lock change actioner', () => {
  let em: EntityManager;
  let effectTargetId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    effectTargetId = em.create(
      new Lock({
        lockId: null,
        state: LockState.LOCKED,
        stateImages: {
          [LockState.LOCKED]: 'Door0-4.png',
          [LockState.UNLOCKED]: 'Door0-5.png'
        }
      }),
      new Renderable({ image: '', zOrder: 1 })
    ).id;
  });

  it('should do nothing if no lock change is present', () => {
    const out = lock({ effectTargetId }, em);
    expect(em.getComponent(effectTargetId, Lock).state).toEqual(
      LockState.LOCKED
    );
    expect(out.worldStateChanged).toEqual(false);
  });
  it('should update the entity manager state when a lock change is present', () => {
    const lockChange = {
      effectTargetId,
      lockChange: {}
    };
    const out = lock(lockChange, em);
    expect(em.getComponent(effectTargetId, Lock).state).toEqual(
      LockState.UNLOCKED
    );
    expect(em.getComponent(effectTargetId, Renderable).image).toEqual(
      'Door0-5.png'
    );
    expect(out.worldStateChanged).toEqual(true);
  });

  it('should not create a Renderable component if one is not already present', () => {
    const lockChange = {
      effectTargetId,
      lockChange: {}
    };
    em.removeComponent(effectTargetId, Renderable);
    const out = lock(lockChange, em);
    expect(em.getComponent(effectTargetId, Lock).state).toEqual(
      LockState.UNLOCKED
    );
    expect(em.getComponent(effectTargetId, Renderable)).toEqual(undefined);
    expect(out.worldStateChanged).toEqual(true);
  });
});
