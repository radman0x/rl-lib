import { radClone } from '@rad/rl-ecs';
import { ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { Blockage } from '../components/blockage.model';
import { Knowledge } from '../components/knowledge.model';
import { Lock, LockState } from '../components/lock.model';
import { GridPos } from '../components/position.model';
import { Sighted } from '../components/sighted.model';
import { AreaResolver } from '../utils/area-resolver.util';
import { housekeepingFlow } from './housekeeping.flow';

describe('Housekeeping flow', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let ender: () => null;
  let viewerPos: { x: number; y: number; z: number };
  beforeEach(() => {
    viewerPos = { x: 2, y: 2, z: 1 };
    em = new EntityManager();
    em.indexBy(GridPos);

    areaResolver = new AreaResolver();
    ender = () => null;
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
    flow.start$.next();
    expect(em.getComponent(blockage, Blockage).active).toEqual(true);
  });
});
