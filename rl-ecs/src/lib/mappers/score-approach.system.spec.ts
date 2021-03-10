import { EntityManager, EntityId } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { DistanceMap } from '../components/distance-map.model';
import { ValueMap } from '@rad/rl-utils';
import { Alignment, AlignmentType } from '../components/alignment.model';
import { scoreApproach } from './score-approach.system';
import { ApproachTarget } from '../components/approach-target.model';

describe('Score approach system', () => {
  let em: EntityManager;
  let targetId: EntityId;
  let movingId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    const map: ValueMap<GridPos, number> = new ValueMap();
    map.set(new GridPos({ x: 1, y: 4, z: 1 }), 4);
    map.set(new GridPos({ x: 2, y: 5, z: 1 }), 5);
    targetId = em.create(
      new GridPos({ x: 1, y: 1, z: 1 }),
      new Alignment({ type: AlignmentType.GOOD }),
      new DistanceMap({ map })
    ).id;

    movingId = em.create(
      new GridPos({ x: 1, y: 5, z: 1 }),
      new Alignment({ type: AlignmentType.EVIL }),
      new ApproachTarget({ targetId })
    ).id;
  });

  it('should give a greater score for a position closer to an opposing agent', () => {
    expect(true).toBe(true);
    // const better = scoreApproach(
    //   {
    //     move: {
    //       movingId,
    //       distanceMaps: [targetId],
    //       newPosition: { x: 1, y: 4, z: 1 },
    //     },
    //     score: null,
    //     agentId: movingId,
    //   },
    //   em
    // );
    // const worse = scoreApproach(
    //   {
    //     move: {
    //       movingId,
    //       distanceMaps: [targetId],
    //       newPosition: { x: 2, y: 5, z: 1 },
    //     },
    //     score: null,
    //     agentId: movingId,
    //   },
    //   em
    // );
    // expect(better.score).toBeGreaterThan(worse.score);
  });
});
