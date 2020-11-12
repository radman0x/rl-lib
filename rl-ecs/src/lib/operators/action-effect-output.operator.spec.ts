import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { Lock, LockState } from '../components/lock.model';
import { GridPos, GridPosData } from '../components/position.model';
import { AreaResolver } from '../utils/area-resolver.util';
import { actionEffectOutput } from './action-effect-output.operator';

describe('Action effect output', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let start$: Subject<any>;
  let error: boolean | string;
  let out: any;
  let pos: GridPosData;
  let effectTargetId: EntityId;
  let newFlow = (any) => null;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    areaResolver = new AreaResolver();

    newFlow = (msg) => {
      let error = false;
      let out = null;
      actionEffectOutput(msg, em, areaResolver, () => null).subscribe({
        next: (msg) => (out = msg),
        error: (err) => (error = err),
      });
      return { error, out };
    };
    pos = { x: 7, y: 7, z: 1 };
    effectTargetId = em.create(
      new Lock({
        lockId: null,
        state: LockState.LOCKED,
        stateImages: {
          [LockState.LOCKED]: 'Door0-4.png',
          [LockState.UNLOCKED]: 'Door0-5.png',
        },
      }),
      new GridPos({ x: 1, y: 1, z: 1 })
    ).id;
  });

  it('should action a teleport', () => {
    const teleport = {
      teleport: { targetLocation: pos },
      effectTargetId,
    };
    const { error, out } = newFlow(teleport);
    expect(error).toEqual(false);
    expect(out.effectReport.spatial.worldStateChangeDescription).toBeTruthy();
    expect(em.getComponent(effectTargetId, GridPos)).toEqual(pos);
  });

  it('should action a lock state change', () => {
    const lockChange = {
      lockChange: {},
      effectTargetId,
    };
    const { error, out } = newFlow(lockChange);
    expect(error).toEqual(false);
    expect(out.effectReport.lock.worldStateChangeDescription).toBeTruthy();
  });
});
