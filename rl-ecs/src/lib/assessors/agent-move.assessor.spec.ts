import { addVec3, CompassDirection } from '@rad/rl-utils';
import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { Attacks } from '../components/attacks.model';
import { Martial } from '../components/martial.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos, GridPosData } from '../components/position.model';
import { Wounds } from '../components/wounds.model';
import { BumpMoveAssessment, bumpMoveAssessor } from './bump-move.assessor';
import { agentMoveAssessor } from './agent-move.assessor';

describe('Agent move asssssor', () => {
  let em: EntityManager;
  let bmAssessor: ReturnType<typeof agentMoveAssessor>;
  let agentId: EntityId;
  let combatTargetId: EntityId;
  let error: boolean | string;
  let out: BumpMoveAssessment;
  const newFlow = (em: EntityManager, rand: Chance.Chance) => {
    const agentAssessor = agentMoveAssessor(em, rand);
    agentAssessor.finish$.subscribe({
      next: msg => {
        out = msg;
      },
      error: err => (error = err)
    });
    return agentAssessor;
  };

  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    error = false;
    bmAssessor = newFlow(em, new Chance());

    const protagPos: GridPosData = { x: 1, y: 1, z: 1 };
    for (let x = -1; x <= 1; ++x) {
      for (let y = -1; y <= 1; ++y) {
        // SOUTH of the player -> NO FLOOR
        if (x === 0 && y === -1) {
          continue;
        }
        // EAST of the player, no floor, only enemmy
        if (x === 1 && y === 0) {
          continue;
        }
        const BASEMENT_OFFSET = -1;
        const basementAdjust = { x, y, z: BASEMENT_OFFSET };
        em.create(
          new GridPos(addVec3(protagPos, basementAdjust)),
          new Physical({ size: Size.FILL })
        );
      }
    }

    // EAST of the player -> COMBAT TARGET
    combatTargetId = em.create(
      new GridPos({ x: 2, y: 1, z: 1 }),
      new Martial({ strength: 1, toughness: 1, weaponSkill: 1 }),
      new Wounds({ current: 10, max: 10 })
    ).id;
    agentId = em.create(
      new GridPos(protagPos),
      new Martial({ strength: 1, toughness: 1, weaponSkill: 1 }),
      new Attacks({ damage: 1 })
    ).id;
  });

  it('should produce correct', () => {
    // bmAssessor.start$.next({ agentId });
    // expect(out).toMatchObject({
    //   move: null,
    //   attack: null
    // });
  });

  it('should produce correct data when only a move is possible', () => {
    // bmAssessor.start$.next({ agentId });
    // expect(out).toMatchObject({
    //   move: {
    //     movingId: agentId,
    //     newPosition: { x: 0, y: 1, z: 1 }
    //   },
    //   attack: null
    // });
  });

  it('should produce correct data when only an attack is possible', () => {
    // bmAssessor = newFlow(em, new Chance(5));
    // bmAssessor.start$.next({ agentId });
    // expect(error).toEqual(false);
    // expect(out).toEqual({
    //   move: null,
    //   attack: {
    //     aggressorId: agentId,
    //     combatTargetId,
    //     strikeSuccess: false,
    //     woundSuccess: false,
    //     damage: null
    //   }
    // });
  });
});
