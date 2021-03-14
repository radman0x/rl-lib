import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Subject } from 'rxjs';
import { mergeMap, reduce, take } from 'rxjs/operators';
import { Lock, LockState } from '../components/lock.model';
import { GridPos, GridPosData } from '../components/position.model';
import { RemoveSelf } from '../components/remove-self.model';
import { Renderable } from '../components/renderable.model';
import { Teleport } from '../components/teleport.model';
import { ToggleLock } from '../components/toggle-lock.model';
import { ChangeReport } from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';
import {
  effectOnEntityFlow,
  effectOnEntityFlowInstant,
} from './effect-on-entity.flow';

describe('Effect on Entity', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let results: {
    outcome: any;
    finished: boolean;
    effectReport: ChangeReport | null;
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
    flow.finish$.subscribe((msg) => (results.effectReport = msg.effectReport));
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
      effectReport: null,
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

    expect(results.error).toBe(false);
    expect(Object.keys(results.effectReport).length).toEqual(1);
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
    expect(results.effectReport).toEqual(null); // no change description received
    expect(results.finished).toEqual(true);
  });

  it('should receive only one finish event regardless of how many effects actioned', () => {
    const effectId = em.create(
      new Teleport({ target: targetPos }),
      new ToggleLock({ lockId: 'A' })
    ).id;
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
    let count = 0;
    process.finish$.subscribe(() => ++count);
    process.start$.next({ effectTargetId, effectId });
    expect(results.error).toBe(false);
    expect(results.finished).toEqual(true);
    expect(count).toEqual(1);
    expect(Object.keys(results.effectReport).length).toEqual(2);
  });

  describe('Instant flow', () => {
    it('should provide an output event when used', () => {
      const instant = effectOnEntityFlowInstant(
        em,
        areaResolver,
        { effectId: em.create().id, effectTargetId },
        () => null
      );
      let message = false;
      let completed = false;
      instant.finish$.subscribe({
        next: () => (message = true),
        complete: () => (completed = true),
      });
      expect(completed).toBe(true);
      expect(message).toBe(true);
    });

    it('should complete correctly when used with a take operator back in the chain', () => {
      // const start = new Subject();
      // const effectId = em.create(new RemoveSelf({})).id;
      // let complete = false;
      // let message = false;
      // let piped = start.pipe(
      //   take(1),
      //   mergeMap(
      //     () =>
      //       effectOnEntityFlowInstant(
      //         em,
      //         areaResolver,
      //         { effectId, effectTargetId },
      //         () => null
      //       ).finish$
      //   )
      // );
      // const test = merge(piped)
      //   .pipe(reduce((acc, curr) => null, null))
      //   .subscribe({
      //     next: () => (message = true),
      //     complete: () => (complete = true),
      //   });
      // start.next();
      // expect(message).toBe(true);
      // expect(complete).toBe(true);
      // expect(em.exists(effectId)).toBe(false);
    });
  });
});
