import { radClone } from '@rad/rl-ecs';
import { ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { Blockage } from '../components/blockage.model';
import { Knowledge } from '../components/knowledge.model';
import { Lock, LockState } from '../components/lock.model';
import { GridPos } from '../components/position.model';
import { Sighted } from '../components/sighted.model';
import { housekeepingFlow } from './housekeeping.flow';

describe('Housekeeping flow', () => {
  let em: EntityManager;
  let viewerId: EntityId;
  let viewerPos: { x: number; y: number; z: number };
  beforeEach(() => {
    viewerPos = { x: 2, y: 2, z: 1 };
    em = new EntityManager();
    em.indexBy(GridPos);
    viewerId = em.create(
      new Knowledge({ current: new ValueMap(), history: new ValueMap() }),
      new Sighted({ range: 1 }),
      new GridPos(viewerPos)
    ).id;

    const z = viewerPos.z - 1;
    for (let x = viewerPos.x - 1; x <= viewerPos.x + 1; ++x) {
      for (let y = viewerPos.y - 1; y <= viewerPos.y + 1; ++y) {
        em.create(new GridPos({ x, y, z }));
      }
    }
  });

  it('should deprecate knowledge for entities with the knowledge component', () => {
    const current = new ValueMap<GridPos, EntityId[]>();
    current.set(new GridPos({ x: 9, y: 9, z: 9 }), [1111]);
    const copy = radClone(current);
    em.setComponent(
      viewerId,
      new Knowledge({ current, history: new ValueMap() })
    );
    const flow = housekeepingFlow(em);
    flow.start$.next();
    const history = em.getComponent(viewerId, Knowledge).history;
    expect(copy).toEqual(history);
  });

  it('should update a sighted entities knowledge', () => {
    const flow = housekeepingFlow(em);
    flow.start$.next();
    const knowledge = em.getComponent(viewerId, Knowledge);
    console.log(knowledge.current);
    expect(knowledge.current.count()).toEqual(10);
  });

  it('should update the state of a blockage', () => {
    const blockage = em.create(
      new Lock({
        lockId: 'A',
        state: LockState.LOCKED,
        stateImages: {
          [LockState.LOCKED]: 'Door0-4.png',
          [LockState.UNLOCKED]: 'Door0-5.png'
        }
      }),
      new Blockage({
        active: false,
        triggers: [
          {
            componentName: Lock.name,
            property: 'state',
            value: LockState.LOCKED,
            activeState: true
          },
          {
            componentName: Lock.name,
            property: 'state',
            value: LockState.UNLOCKED,
            activeState: false
          }
        ]
      })
    ).id;
    const flow = housekeepingFlow(em);
    flow.start$.next();
    expect(em.getComponent(blockage, Blockage).active).toEqual(true);
  });

  it('should behave well if completed without receiving a value', () => {});
});
