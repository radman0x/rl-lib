import { ValueMap } from '@rad/rl-utils';
import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { updateDistanceMap } from '../actioners/update-distance-map.actioner';
import { Alignment, AlignmentType } from '../components/alignment.model';
import { ApproachTarget } from '../components/approach-target.model';
import { DistanceMap } from '../components/distance-map.model';
import { Mobile } from '../components/mobile.model';
import { MovingAgent } from '../components/moving-agent.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { Sighted } from '../components/sighted.model';
import { Strength } from '../components/strength.model';
import { Toughness } from '../components/toughness.model';
import { WeaponSkill } from '../components/weapon-skill.model';
import { Order, SpatialReport } from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';
import { allAgentUpdateFlow } from './all-agent-update.flow';

describe('All agent update', () => {
  let em: EntityManager;
  let areaResolver = new AreaResolver();
  let results: {
    outcome: any;
    finished: boolean;
    completedActions: Order[] | null;
    error: boolean | string;
  };
  let agentId: EntityId;
  let spatialId: EntityId;
  let spatialReport: SpatialReport;
  let process: ReturnType<typeof allAgentUpdateFlow>;
  let error: (any) => void;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    process = allAgentUpdateFlow(em, areaResolver, new Chance());
    for (let x = 1; x < 2; ++x) {
      for (let y = 1; y < 6; ++y) {
        em.create(
          new GridPos({ x, y, z: 0 }),
          new Physical({ size: Size.FILL })
        );
      }
    }
    spatialId = em.create(
      new GridPos({ x: 1, y: 5, z: 1 }),
      new DistanceMap({ map: new ValueMap() }),
      new Alignment({ type: AlignmentType.GOOD })
    ).id;
    agentId = em.create(
      new GridPos({ x: 1, y: 1, z: 1 }),
      new Sighted({ range: 5 }),
      new MovingAgent({}),
      new Mobile({ range: 1 }),
      new Alignment({ type: AlignmentType.EVIL }),
      new ApproachTarget({ targetId: spatialId })
    ).id;
    spatialReport = { spatialReport: { spatialId, newPos: null } };
    updateDistanceMap(spatialReport, em);
    error = jest.fn();
  });

  it('should process and move one agent', () => {
    const moveTarget = { x: 1, y: 2, z: 1 };
    of(null)
      .pipe(process)
      .subscribe({
        next: (msg) => {
          expect(msg[0]).toMatchObject({
            movingId: agentId,
            newPosition: moveTarget,
          });
        },
        error,
      });
    expect(error).not.toHaveBeenCalled();
    expect(em.getComponent(agentId, GridPos)).toEqual(moveTarget);

    expect.assertions(3);
  });

  it('should get an order summary for an attack for one agent', () => {
    const combatTargetId = em.create(
      new GridPos({ x: 1, y: 2, z: 1 }),
      new Strength({ count: 3 }),
      new Toughness({ count: 3 }),
      new WeaponSkill({ count: 3 }),
      new Alignment({ type: AlignmentType.GOOD })
    ).id;
    em.setComponent(agentId, new Strength({ count: 3 }));
    em.setComponent(agentId, new Toughness({ count: 3 }));
    em.setComponent(agentId, new WeaponSkill({ count: 3 }));

    of(null)
      .pipe(process)
      .subscribe({
        next: (msg) => {
          expect(msg[0]).toMatchObject({
            combatTargetId,
          });
        },
        error,
      });
    expect(error).not.toHaveBeenCalled();

    expect.assertions(2);
  });

  it('should get an order summary for two agents', () => {
    em.create(
      new GridPos({ x: 1, y: 2, z: 0 }),
      new Physical({ size: Size.FILL })
    ).id;
    const agent2Id = em.create(
      new GridPos({ x: 2, y: 1, z: 1 }),
      new MovingAgent({}),
      new Mobile({ range: 1 }),
      new Alignment({ type: AlignmentType.EVIL }),
      new Sighted({ range: 5 }),
      new ApproachTarget({ targetId: spatialId })
    ).id;

    of(null)
      .pipe(process)
      .subscribe({
        next: (msg) => {
          expect(msg[0]).toMatchObject({
            movingId: agentId,
            newPosition: { x: 1, y: 2, z: 1 },
          });
          expect(msg[1]).toMatchObject({
            movingId: agent2Id,
            newPosition: { x: 1, y: 2, z: 1 },
          });
        },
        error,
      });
    expect(error).not.toHaveBeenCalled();

    expect.assertions(3);
  });

  it('should only get a movement from one AI if the other moves first and blocks it', () => {
    em.create(
      new GridPos({ x: 1, y: 2, z: 0 }),
      new Physical({ size: Size.FILL })
    ).id;
    // em.setComponent(agentId, new Physical({ size: Size.FILL }));
    em.create(
      new GridPos({ x: 1, y: 1, z: 1 }),
      new MovingAgent({}),
      new Alignment({ type: AlignmentType.EVIL }),
      new Sighted({ range: 5 }),
      new ApproachTarget({ targetId: spatialId })
    ).id;

    of(null)
      .pipe(process)
      .subscribe({
        next: (msg) => {
          expect(msg.length).toEqual(1);
          expect(msg[0]).toMatchObject({
            movingId: agentId,
            newPosition: { x: 1, y: 2, z: 1 },
          });
        },
        error,
      });
    expect(error).not.toHaveBeenCalled();

    expect.assertions(3);
  });

  it('should behave well if there are no agents to be updated', () => {
    em.remove(agentId);
    of(null)
      .pipe(process)
      .subscribe({
        next: (msg) => {
          expect(msg.length).toEqual(0);
        },
        error,
      });
    expect(error).not.toHaveBeenCalled();

    expect.assertions(2);
  });
});
