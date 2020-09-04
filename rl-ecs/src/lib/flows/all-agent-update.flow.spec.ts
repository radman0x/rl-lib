import { EntityId, EntityManager } from 'rad-ecs';
import { GridPosData, GridPos } from '../components/position.model';
import { Teleport } from '../components/teleport.model';
import { Descriptions, effectOnEntityFlow } from './effect-on-entity.flow';
import { ToggleLock } from '../components/toggle-lock.model';
import { Lock, LockState } from '../components/lock.model';
import { Renderable } from '../components/renderable.model';
import { AreaResolver } from '../utils/area-resolver.util';
import { allAgentUpdateFlow } from './all-agent-update.flow';

import * as Chance from 'chance';
import { MovingAgent } from '../components/moving-agent.model';
import { Physical, Size } from '../components/physical.model';
import { MoveOrder } from '../systems.types';

describe('Effect on Entity', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let results: {
    outcome: any;
    finished: boolean;
    completedActions: (MoveOrder & { score: number | null })[] | null;
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
  let process: ReturnType<typeof newFlow>;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    areaResolver = new AreaResolver();
    results = {
      outcome: null,
      finished: false,
      completedActions: null,
      error: false
    };
    process = newFlow(em);
    agentId = em.create(new GridPos({ x: 1, y: 1, z: 1 }), new MovingAgent({}))
      .id;
  });

  it('should get a order summary for one agent', () => {
    em.create(
      new GridPos({ x: 1, y: 2, z: 0 }),
      new Physical({ size: Size.FILL })
    ).id;
    process.start$.next();
    expect(results.error).toBe(false);
    expect(results.completedActions[0]).toMatchObject({
      score: 10,
      movingId: agentId,
      newPosition: { x: 1, y: 2, z: 1 }
    });
    expect(em.getComponent(agentId, GridPos)).toEqual({ x: 1, y: 2, z: 1 });
  });

  it('should get an order summary for two agents', () => {
    em.create(
      new GridPos({ x: 1, y: 2, z: 0 }),
      new Physical({ size: Size.FILL })
    ).id;
    const agent2Id = em.create(
      new GridPos({ x: 2, y: 1, z: 1 }),
      new MovingAgent({})
    ).id;
    process.start$.next();
    expect(results.error).toBe(false);
    expect(results.completedActions[0]).toMatchObject({
      score: 10,
      movingId: agentId,
      newPosition: { x: 1, y: 2, z: 1 }
    });
    expect(results.completedActions[1]).toMatchObject({
      score: 10,
      movingId: agent2Id,
      newPosition: { x: 1, y: 2, z: 1 }
    });
  });
});
