import { EntityManager, EntityId } from 'rad-ecs';
import { positionsAroundEntity } from './positions-around-entity.system';
import { GridPos } from '../components/position.model';

describe('Positions around entity', () => {
  let em: EntityManager;
  let agentId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    agentId = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
  });

  it('should provide a single entry with target pos as null if agent not set', () => {
    const around = positionsAroundEntity({ agentId: null }, em);
    expect(around.length).toEqual(1);
    expect(around[0]).toEqual({ agentId: null, targetPos: null });
  });

  it('should provide a single entry with target if agent has no position', () => {
    em.removeComponent(agentId, GridPos);
    const around = positionsAroundEntity({ agentId }, em);
    expect(around.length).toEqual(1);
    expect(around[0]).toEqual({ agentId, targetPos: null });
  });

  it('should provide 8 entries with target if agent has position', () => {
    const around = positionsAroundEntity({ agentId }, em);
    expect(around.length).toEqual(8);
  });
});
