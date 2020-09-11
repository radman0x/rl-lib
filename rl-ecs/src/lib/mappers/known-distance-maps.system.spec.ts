import { ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { DistanceMap } from '../components/distance-map.model';
import { GridPos } from '../components/position.model';
import { Sighted } from '../components/sighted.model';
import { ActiveAgent } from '../systems.types';
import { knownDistanceMaps } from './known-distance-maps.system';

describe('Known distance maps', () => {
  let em: EntityManager;
  let agentId: EntityId;
  let msg: ActiveAgent;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    agentId = em.create(
      new GridPos({ x: 1, y: 1, z: 0 }),
      new Sighted({ range: 2 })
    ).id;
    msg = { agentId };
  });
  it('should output null if agentId is not set correctly', () => {
    expect(knownDistanceMaps({ agentId: null }, em)).toEqual({
      agentId: null,
      distanceMaps: null
    });
  });

  it('should provide an entity with a distance map when it is in range', () => {
    const targetId = em.create(
      new GridPos({ x: 2, y: 3, z: 0 }),
      new DistanceMap({ map: new ValueMap() })
    ).id;
    expect(knownDistanceMaps(msg, em).distanceMaps).toEqual([targetId]);
  });
});
