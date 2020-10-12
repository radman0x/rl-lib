import { EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';
import { Blockage } from '../components/blockage.model';
import { EndState, EndType } from '../components/end-state.model';
import { Lock, LockState } from '../components/lock.model';
import { NonePresent } from '../components/none-present.model';
import { GridPos } from '../components/position.model';
import { AreaResolver } from '../utils/area-resolver.util';
import { housekeepingFlow, housekeepingFlowInstant } from './housekeeping.flow';

describe('Housekeeping flow', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let ender: () => null;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);

    areaResolver = new AreaResolver();
    ender = () => null;
  });

  it('should execute correctly when used in an observable of observables context', () => {
    const start = new Subject();
    const NOT_EXIST_ID = 999;
    em.create(
      new NonePresent({ entities: [NOT_EXIST_ID] }),
      new EndState({ endType: EndType.VICTORY })
    );
    let ended = false;
    let count = 0;
    start
      .pipe(
        mergeMap(() =>
          housekeepingFlowInstant(em, areaResolver, () => (ended = true))
        )
      )
      .subscribe(() => {
        ++count;
      });
    const finish = housekeepingFlowInstant(
      em,
      areaResolver,
      () => (ended = true)
    );
    finish.subscribe(() => null);
    start.next();
    expect(count).toEqual(1);
    expect(ended).toEqual(true);
  });

  it('the instant variant should operate correctly', () => {
    const NOT_EXIST_ID = 999;
    em.create(
      new NonePresent({ entities: [NOT_EXIST_ID] }),
      new EndState({ endType: EndType.VICTORY })
    );
    let ended = false;
    let count = 0;
    const finish = housekeepingFlowInstant(
      em,
      areaResolver,
      () => (ended = true)
    );
    finish.subscribe(() => ++count);
    expect(count).toEqual(1);
    expect(ended).toEqual(true);
  });

  it('should update the state of a blockage', () => {
    const blockage = em.create(
      new Lock({
        lockId: 'A',
        state: LockState.LOCKED,
        stateImages: {
          [LockState.LOCKED]: 'Door0-4.png',
          [LockState.UNLOCKED]: 'Door0-5.png',
        },
      }),
      new Blockage({
        active: false,
        triggers: [
          {
            componentName: Lock.name,
            property: 'state',
            value: LockState.LOCKED,
            activeState: true,
          },
          {
            componentName: Lock.name,
            property: 'state',
            value: LockState.UNLOCKED,
            activeState: false,
          },
        ],
      })
    ).id;
    const flow = housekeepingFlow(em, areaResolver, ender);
    flow.finish$.subscribe(() => null);
    flow.start$.next();
    expect(em.getComponent(blockage, Blockage).active).toEqual(true);
  });

  it('should trigger a none present condition', () => {
    const NOT_EXIST_ID = 999;
    em.create(
      new NonePresent({ entities: [NOT_EXIST_ID] }),
      new EndState({ endType: EndType.VICTORY })
    );
    let ended = false;
    const flow = housekeepingFlow(em, areaResolver, () => (ended = true));
    flow.finish$.subscribe(() => null);
    flow.start$.next();
    expect(ended).toEqual(true);
  });
});
