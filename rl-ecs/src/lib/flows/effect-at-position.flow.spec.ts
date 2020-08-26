import { EntityManager, EntityId } from 'rad-ecs';
import { Descriptions, effectOnEntityFlow } from './effect-on-entity.flow';
import { GridPosData, GridPos } from '../components/position.model';
import { effectAtPositionFlow, Summaries } from './effect-at-position.flow';
import { ToggleLock } from '../components/toggle-lock.model';
import { Lock, LockState } from '../components/lock.model';
import { Renderable } from '../components/renderable.model';
import { Teleport } from '../components/teleport.model';
import { AreaResolver } from '../utils/area-resolver.util';

function standardLock(em: EntityManager, pos: GridPosData) {
  return em.create(
    new Lock({
      lockId: null,
      state: LockState.LOCKED,
      stateImages: {
        [LockState.LOCKED]: 'Door0-4.png',
        [LockState.UNLOCKED]: 'Door0-5.png'
      }
    }),
    new Renderable({ image: '', zOrder: 1 }),
    new GridPos(pos)
  );
}

describe('Effect at position flow', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let results: {
    outcome: any;
    finished: boolean;
    summaries: Summaries | null;
    error: boolean | string;
  };
  const newFlow = (em: EntityManager) => {
    const flow = effectAtPositionFlow(em, areaResolver);
    flow.finish$.subscribe({
      next: msg => {
        results.outcome = msg;
        results.finished = true;
      },
      error: err => (results.error = err)
    });
    flow.stateChangeSummaries$.subscribe(msg => (results.summaries = msg));
    return flow;
  };
  let effectTargetId: EntityId;
  let process: ReturnType<typeof newFlow>;
  let targetPos: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    areaResolver = new AreaResolver();
    results = {
      outcome: null,
      finished: false,
      summaries: null,
      error: false
    };
    process = newFlow(em);
    effectTargetId = em.create().id;
    targetPos = { x: 1, y: 1, z: 1 };
  });

  it('should receive an empty outcome summary if the effect does not change the world state', () => {
    process.start$.next({ targetPos, effectId: em.create().id });
    expect(results.summaries).toEqual({});
  });

  it('should receive a finish event if no effect is actioned', () => {
    process.start$.next({ targetPos, effectId: em.create().id });
    expect(results.finished).toBe(true);
  });

  it('should receive the correct output when multiple outcomes occur as part of applying an effect', () => {
    const effectId = em.create(
      new ToggleLock({ lockId: 'A' }),
      new Teleport({ target: { x: 2, y: 2, z: 2 } })
    ).id;
    effectTargetId = standardLock(em, targetPos).id;
    process.start$.next({ effectId, targetPos });
    expect(results.error).toBe(false);
    expect(results.summaries).toMatchObject({
      [effectTargetId]: [{}, {}]
    });
  });
  it('should update the state of a locked entity when a toggle lock effect is applied at its position', () => {
    const effectId = em.create(new ToggleLock({ lockId: 'A' })).id;
    effectTargetId = standardLock(em, targetPos).id;
    process.start$.next({ effectId, targetPos });

    expect(results.error).toBe(false);
    expect(results.summaries).toMatchObject({
      [effectTargetId]: [{}]
    });
    expect(em.getComponent(effectTargetId, Lock)).toMatchObject({
      state: LockState.UNLOCKED
    });
    expect(em.getComponent(effectTargetId, Renderable).image).toEqual(
      'Door0-5.png'
    );
  });
});
