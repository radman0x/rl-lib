import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { updateDistanceMap } from '../actioners/update-distance-map.actioner';
import { Alignment, AlignmentType } from '../components/alignment.model';
import { Martial } from '../components/martial.model';
import { MovingAgent } from '../components/moving-agent.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { Sighted } from '../components/sighted.model';
import { allAgentUpdateFlow, Order } from './all-agent-update.flow';

describe('All agent update', () => {
  let em: EntityManager;
  let results: {
    outcome: any;
    finished: boolean;
    completedActions: Order[] | null;
    error: boolean | string;
  };
  const newFlow = (em: EntityManager) => {
    const flow = allAgentUpdateFlow(em, new Chance());
    flow.finish$.subscribe({
      next: msg => {
        results.outcome = msg;
        results.finished = true;
      },
      error: err => (results.error = err)
    });
    flow.finish$.subscribe(msg => (results.completedActions = msg));
    return flow;
  };
  let agentId: EntityId;
  let locusId: EntityId;
  let process: ReturnType<typeof newFlow>;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    results = {
      outcome: null,
      finished: false,
      completedActions: null,
      error: false
    };
    process = newFlow(em);
    for (let x = 1; x < 2; ++x) {
      for (let y = 1; y < 6; ++y) {
        em.create(
          new GridPos({ x, y, z: 0 }),
          new Physical({ size: Size.FILL })
        );
      }
    }
    agentId = em.create(
      new GridPos({ x: 1, y: 1, z: 1 }),
      new Sighted({ range: 5 }),
      new MovingAgent({}),
      new Alignment({ type: AlignmentType.EVIL })
    ).id;
    locusId = em.create(
      new GridPos({ x: 1, y: 5, z: 1 }),
      new Alignment({ type: AlignmentType.GOOD })
    ).id;
    updateDistanceMap({ locusId }, em);
  });

  it('should get an order summary for a move for one agent', () => {
    process.start$.next();
    expect(results.error).toBe(false);
    expect(results.completedActions[0]).toMatchObject({
      movingId: agentId,
      newPosition: { x: 1, y: 2, z: 1 }
    });
    expect(em.getComponent(agentId, GridPos)).toEqual({ x: 1, y: 2, z: 1 });
  });

  it('should get an order summary for an attack for one agent', () => {
    const combatTargetId = em.create(
      new GridPos({ x: 1, y: 2, z: 1 }),
      new Martial({ weaponSkill: 3, toughness: 3, strength: 3 })
    ).id;
    em.setComponent(
      agentId,
      new Martial({ weaponSkill: 3, toughness: 3, strength: 3 })
    );
    process.start$.next();
    expect(results.error).toBe(false);
    expect(results.completedActions[0]).toMatchObject({
      combatTargetId
    });
  });

  it('should get an order summary for two agents', () => {
    em.create(
      new GridPos({ x: 1, y: 2, z: 0 }),
      new Physical({ size: Size.FILL })
    ).id;
    const agent2Id = em.create(
      new GridPos({ x: 2, y: 1, z: 1 }),
      new MovingAgent({}),
      new Alignment({ type: AlignmentType.EVIL }),
      new Sighted({ range: 5 })
    ).id;
    process.start$.next();
    expect(results.error).toBe(false);
    expect(results.completedActions[0]).toMatchObject({
      movingId: agentId,
      newPosition: { x: 1, y: 2, z: 1 }
    });
    expect(results.completedActions[1]).toMatchObject({
      movingId: agent2Id,
      newPosition: { x: 1, y: 2, z: 1 }
    });
  });

  it('should only get a movement from one AI if the other moves first and blocks it', () => {
    em.create(
      new GridPos({ x: 1, y: 2, z: 0 }),
      new Physical({ size: Size.FILL })
    ).id;
    em.setComponent(agentId, new Physical({ size: Size.FILL }));
    const agent2Id = em.create(
      new GridPos({ x: 1, y: 1, z: 1 }),
      new MovingAgent({}),
      new Alignment({ type: AlignmentType.EVIL }),
      new Sighted({ range: 5 })
    ).id;
    process.start$.next();
    expect(results.error).toBe(false);
    expect(results.completedActions.length).toEqual(1);
    expect(results.completedActions[0]).toMatchObject({
      movingId: agentId,
      newPosition: { x: 1, y: 2, z: 1 }
    });
  });

  it('should behave well if there are no agents to be update', () => {
    em.remove(agentId);
    process.start$.next();
    expect(results.error).toBe(false);
    expect(results.completedActions.length).toEqual(0);
  });
});
