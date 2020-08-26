import { EntityManager, EntityId } from 'rad-ecs';
import { Subject } from 'rxjs';
import { GridPos, GridPosData } from '../components/position.model';
import { Teleported, LockChange } from '../systems.types';
import { actionEffectOutput } from './action-effect-output.operator';
import { Lock, LockState } from '../components/lock.model';
import { AreaResolver } from '../utils/area-resolver.util';

describe('Action effect output', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let start$: Subject<any>;
  let error: boolean | string;
  let out: any;
  let pos: GridPosData;
  let effectTargetId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    areaResolver = new AreaResolver();
    start$ = new Subject();
    error = false;
    out = null;
    start$.pipe(actionEffectOutput(em, areaResolver)).subscribe({
      next: msg => (out = msg),
      error: err => (error = err)
    });
    pos = { x: 7, y: 7, z: 1 };
    effectTargetId = em.create(
      new Lock({
        lockId: null,
        state: LockState.LOCKED,
        stateImages: {
          [LockState.LOCKED]: 'Door0-4.png',
          [LockState.UNLOCKED]: 'Door0-5.png'
        }
      }),
      new GridPos({ x: 1, y: 1, z: 1 })
    ).id;
  });

  it('should action a teleport', () => {
    const teleport = {
      teleport: { targetLocation: pos },
      effectTargetId
    };
    start$.next(teleport);
    expect(error).toEqual(false);
    expect(out).toMatchObject({ worldStateChanged: true });
    expect(em.getComponent(effectTargetId, GridPos)).toEqual(pos);
  });

  it('should action a lock state change', () => {
    const lockChange = {
      lockChange: {},
      effectTargetId
    };
    start$.next(lockChange);
    expect(error).toEqual(false);
    expect(out).toMatchObject({ worldStateChanged: true });
  });
});
