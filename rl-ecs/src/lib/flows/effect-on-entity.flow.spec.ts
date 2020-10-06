import { EntityId, EntityManager } from 'rad-ecs';
import { GridPosData, GridPos } from '../components/position.model';
import { Teleport } from '../components/teleport.model';
import { Descriptions, effectOnEntityFlow } from './effect-on-entity.flow';
import { ToggleLock } from '../components/toggle-lock.model';
import { Lock, LockState } from '../components/lock.model';
import { Renderable } from '../components/renderable.model';
import { AreaResolver } from '../utils/area-resolver.util';

describe('Effect on Entity', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let results: {
    outcome: any;
    finished: boolean;
    descriptions: Descriptions[] | null;
    error: boolean | string;
  };
  const newFlow = (em: EntityManager) => {
    const flow = effectOnEntityFlow(em, areaResolver, () => null);
    flow.finish$.subscribe({
      next: (msg) => {
        results.outcome = msg;
        results.finished = true;
      },
      error: (err) => (results.error = err),
    });
    flow.stateChangeSummary$.subscribe((msg) => (results.descriptions = msg));
    return flow;
  };
  let effectTargetId: EntityId;
  let process: ReturnType<typeof newFlow>;
  let targetPos: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    areaResolver = new AreaResolver();
    results = {
      outcome: null,
      finished: false,
      descriptions: null,
      error: false,
    };
    process = newFlow(em);
    effectTargetId = em.create().id;
    targetPos = { x: 1, y: 1, z: 1 };
  });

  it('should update the position of an entity when a Teleport effect is applied to it', () => {
    const effectId = em.create(new Teleport({ target: targetPos })).id;
    process.start$.next({ effectTargetId, effectId });
    expect(results.error).toBe(false);
    expect(em.getComponent(effectTargetId, GridPos)).toEqual(targetPos);
  });

  it('should update the state of a locked entity when a toggle lock effect is applied to it', () => {
    const effectId = em.create(new ToggleLock({ lockId: 'A' })).id;
    const effectTargetId = em.create(
      new Lock({
        lockId: null,
        state: LockState.LOCKED,
        stateImages: {
          [LockState.LOCKED]: 'Door0-4.png',
          [LockState.UNLOCKED]: 'Door0-5.png',
        },
      }),
      new Renderable({ image: '', zOrder: 1 })
    ).id;
    process.start$.next({ effectTargetId, effectId });

    console.log(JSON.stringify(results.descriptions, null, 2));
    expect(results.error).toBe(false);
    expect(results.descriptions.length).toEqual(1);
    expect(em.getComponent(effectTargetId, Lock)).toMatchObject({
      state: LockState.UNLOCKED,
    });
    expect(em.getComponent(effectTargetId, Renderable).image).toEqual(
      'Door0-5.png'
    );
  });

  it('should behave well if the input effect contains no components', () => {
    const effectId = em.create().id;
    process.start$.next({ effectTargetId, effectId });
    expect(results.error).toBe(false);
    expect(results.descriptions).toEqual(null); // no change description received
    expect(results.finished).toEqual(true);
  });

  it('should receive only one finish event regardless of how many effects actioned', () => {
    const effectId = em.create(new Teleport({ target: targetPos })).id;
    let count = 0;
    process.finish$.subscribe(() => ++count);
    process.start$.next({ effectTargetId, effectId });
    expect(results.error).toBe(false);
    expect(results.finished).toEqual(true);
    expect(count).toEqual(1);
  });
});
