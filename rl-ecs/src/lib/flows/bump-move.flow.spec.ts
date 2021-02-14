import { EntityManager, EntityId, ECSData } from 'rad-ecs';
import { GridPos, GridPosData } from '../components/position.model';
import { addVec3, CompassDirection } from '@rad/rl-utils';
import { Physical, Size } from '../components/physical.model';
import { attemptMoveFlow } from './bump-move.flow';
import { Martial } from '../components/martial.model';
import { AreaResolver } from '../utils/area-resolver.util';

import * as Chance from 'chance';
import { Attacks } from '../components/attacks.model';
import { Wounds } from '../components/wounds.model';
import { merge } from 'rxjs';
import { WeaponSkill } from '../components/weapon-skill.model';
import { Toughness } from '../components/toughness.model';
import { Strength } from '../components/strength.model';

describe('Bump move flow', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  let moveFlow: ReturnType<typeof attemptMoveFlow>;
  let movingId: EntityId;
  let combatTargetId: EntityId;
  let startEmData: ECSData;

  beforeEach(() => {
    areaResolver = new AreaResolver();
    em = new EntityManager();
    em.indexBy(GridPos);
    const protagPos: GridPosData = { x: 1, y: 1, z: 1 };
    for (let x = -1; x <= 1; ++x) {
      for (let y = -1; y <= 1; ++y) {
        // SOUTH of the player -> NO FLOOR
        if (x === 0 && y === -1) {
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
    // NORTH of the player -> BLOCKED
    em.create(
      new GridPos({ x: 1, y: 2, z: 1 }),
      new Physical({ size: Size.FILL })
    );
    // EAST of the player -> COMBAT TARGET
    combatTargetId = em.create(
      new GridPos({ x: 2, y: 1, z: 1 }),
      new WeaponSkill({ count: 1 }),
      new Strength({ count: 1 }),
      new Toughness({ count: 1 }),
      new Wounds({ current: 10, max: 10 })
    ).id;
    movingId = em.create(
      new GridPos(protagPos),
      new WeaponSkill({ count: 1 }),
      new Strength({ count: 1 }),
      new Toughness({ count: 1 }),
      new Attacks({ damage: 1 })
    ).id;

    startEmData = em.export();
  });

  it('should behave well if completed without receiving a value', () => {
    let message = jest.fn();
    const { start$, attacked$, moved$, noActionTaken$ } = attemptMoveFlow(
      em,
      new Chance()
    );
    merge(moved$, attacked$, noActionTaken$).subscribe(message);
    start$.complete();
    expect(message).not.toHaveBeenCalled();
  });

  it('should error out if the moving entity id does not exist in the em', () => {
    const ID_NOT_EXIST = 9999999;
    const errorHandler = jest.fn();
    moveFlow = attemptMoveFlow(em, new Chance());
    const { start$, attacked$, moved$, noActionTaken$ } = attemptMoveFlow(
      em,
      new Chance()
    );
    merge(noActionTaken$).subscribe({ error: errorHandler });
    start$.next({
      direction: CompassDirection.W,
      movingId: ID_NOT_EXIST,
    });

    expect(errorHandler).toHaveBeenCalledTimes(1);
  });

  describe('Simple deterministic results', () => {
    let moved: boolean;
    let attacked: boolean;
    let noAction: boolean;
    beforeEach(() => {
      moved = false;
      attacked = false;
      noAction = false;
      moveFlow = attemptMoveFlow(em, new Chance());
      moveFlow.moved$.subscribe(() => (moved = true));
      moveFlow.attacked$.subscribe(() => (attacked = true));
      moveFlow.noActionTaken$.subscribe(() => (noAction = true));
    });
    it('should update the em state on successful move', () => {
      moveFlow.start$.next({ direction: CompassDirection.W, movingId });
      startEmData.entities[movingId]['GridPos'] = { x: 0, y: 1, z: 1 };
      expect(startEmData).toEqual(em.export());
    });
    it('should produce expected events on successful move', () => {
      moveFlow.start$.next({ direction: CompassDirection.W, movingId });
      expect(moved).toEqual(true);
      expect(attacked).toEqual(false);
      expect(noAction).toEqual(false);
    });

    it('should NOT update the em state when no action is taken', () => {
      expect(startEmData).toEqual(em.export());
    });

    it('should produce expected events when no action is taken', () => {
      moveFlow.start$.next({ direction: CompassDirection.S, movingId });
      expect(moved).toEqual(false);
      expect(attacked).toEqual(false);
      expect(noAction).toEqual(true);
    });
  });

  describe('Non deterministic combat results', () => {
    let moved: boolean;
    let attacked: boolean;
    let noAction: boolean;
    let finished: boolean;
    let subMoveFlow: any;
    let error: boolean | string;
    beforeEach(() => {
      moved = false;
      attacked = false;
      noAction = false;
      error = false;
      subMoveFlow = (moveFlow) => {
        moveFlow.moved$.subscribe(() => (moved = true));
        moveFlow.attacked$.subscribe(() => (attacked = true));
        moveFlow.noActionTaken$.subscribe(() => (noAction = true));
      };
    });
    it('should update the em state when damage successfully inflicted', () => {
      moveFlow = attemptMoveFlow(em, new Chance(13));
      subMoveFlow(moveFlow);
      moveFlow.attacked$.subscribe((msg) => {
        expect(msg.strikeSuccess).toBe(true);
        expect(msg.woundSuccess).toBe(true);
        expect(msg.damage.amount).toEqual(1);
      });
      moveFlow.start$.next({ direction: CompassDirection.E, movingId });
      expect(error).toBe(false);
      startEmData.entities[combatTargetId]['Wounds'] = { current: 9, max: 10 };
      expect(em.export()).toEqual(startEmData);

      expect.assertions(5);
    });

    it('should NOT update the state of the em when the attack was unsuccessful', () => {
      moveFlow = attemptMoveFlow(em, new Chance(1));
      subMoveFlow(moveFlow);
      let hit: boolean;
      moveFlow.attacked$.subscribe((msg) => {
        hit = msg.strikeSuccess;
      });
      moveFlow.start$.next({ direction: CompassDirection.E, movingId });
      expect(error).toBe(false);
      expect(hit).toEqual(false);
      expect(em.export()).toEqual(startEmData);
    });

    it('should produce expected events on an attack', () => {
      moveFlow = attemptMoveFlow(em, new Chance(2));
      subMoveFlow(moveFlow);
      moveFlow.start$.next({ direction: CompassDirection.E, movingId });
      expect(error).toBe(false);
      expect(moved).toEqual(false);
      expect(attacked).toEqual(true);
      expect(noAction).toEqual(false);
    });
  });
});
