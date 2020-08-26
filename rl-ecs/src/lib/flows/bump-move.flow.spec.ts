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
      new Martial({ strength: 1, toughness: 1, weaponSkill: 1 }),
      new Wounds({ current: 10, max: 10 })
    ).id;
    movingId = em.create(
      new GridPos(protagPos),
      new Martial({ strength: 1, toughness: 1, weaponSkill: 1 }),
      new Attacks({ damage: 1 })
    ).id;

    startEmData = em.export();
  });

  it('should behave well if completed without receiving a value', () => {
    let finished = false;
    moveFlow = attemptMoveFlow(em, new Chance());
    moveFlow.finish$.subscribe(() => (finished = true));
    moveFlow.start$.complete();
    expect(finished).toEqual(false);
  });

  it('should error out if the moving entity id does not exist in the em', () => {
    const ID_NOT_EXIST = 9999999;
    let errored = false;
    moveFlow = attemptMoveFlow(em, new Chance());
    moveFlow.finish$.subscribe({
      error: msg => {
        errored = true;
      }
    });
    moveFlow.start$.next({
      direction: CompassDirection.W,
      movingId: ID_NOT_EXIST
    });

    expect(errored).toEqual(true);
  });

  describe('Simple deterministic results', () => {
    let moved: boolean;
    let attacked: boolean;
    let noAction: boolean;
    let finished: boolean;
    beforeEach(() => {
      moved = false;
      attacked = false;
      noAction = false;
      finished = false;
      moveFlow = attemptMoveFlow(em, new Chance());
      moveFlow.moved$.subscribe(() => (moved = true));
      moveFlow.attacked$.subscribe(() => (attacked = true));
      moveFlow.noActionTaken$.subscribe(() => (noAction = true));
      moveFlow.finish$.subscribe(() => (finished = true));
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
      expect(finished).toEqual(true);
    });

    it('should NOT update the em state when no action is taken', () => {
      expect(startEmData).toEqual(em.export());
    });

    it('should produce expected events when no action is taken', () => {
      moveFlow.start$.next({ direction: CompassDirection.S, movingId });
      expect(moved).toEqual(false);
      expect(attacked).toEqual(false);
      expect(noAction).toEqual(true);
      expect(finished).toEqual(true);
    });

    it('should always produce a finish event', () => {
      let finished = false;
      moveFlow.finish$.subscribe(() => (finished = true));
      moveFlow.start$.next({ direction: CompassDirection.W, movingId });
      expect(finished).toEqual(true);
      // could do more cases...
    });
  });

  describe('Non deterministic combat results', () => {
    let moved: boolean;
    let attacked: boolean;
    let noAction: boolean;
    let finished: boolean;
    let subMoveFlow: any;
    beforeEach(() => {
      moved = false;
      attacked = false;
      noAction = false;
      finished = false;
      subMoveFlow = moveFlow => {
        moveFlow.moved$.subscribe(() => (moved = true));
        moveFlow.attacked$.subscribe(() => (attacked = true));
        moveFlow.noActionTaken$.subscribe(() => (noAction = true));
        moveFlow.finish$.subscribe(() => (finished = true));
      };
    });
    it('should update the em state when damage successfully inflicted', () => {
      moveFlow = attemptMoveFlow(em, new Chance(13));
      subMoveFlow(moveFlow);
      let hit: boolean;
      let wound: boolean;
      let damageInflicted: number;
      moveFlow.finish$.subscribe(msg => {
        hit = msg.attack.strikeSuccess;
        wound = msg.attack.woundSuccess;
        damageInflicted = msg.attack.damage.amount;
      });
      moveFlow.start$.next({ direction: CompassDirection.E, movingId });
      startEmData.entities[combatTargetId]['Wounds'] = { current: 9, max: 10 };
      expect(hit).toEqual(true);
      expect(wound).toEqual(true);
      expect(damageInflicted).toEqual(1);
      expect(em.export()).toEqual(startEmData);
    });

    it('should NOT update the state of the em when the attack was unsuccessful', () => {
      moveFlow = attemptMoveFlow(em, new Chance(1));
      subMoveFlow(moveFlow);
      let hit: boolean;
      moveFlow.finish$.subscribe(msg => {
        hit = msg.attack.strikeSuccess;
      });
      moveFlow.start$.next({ direction: CompassDirection.E, movingId });
      expect(hit).toEqual(false);
      expect(em.export()).toEqual(startEmData);
    });

    it('should produce expected events on an attack', () => {
      moveFlow = attemptMoveFlow(em, new Chance(2));
      subMoveFlow(moveFlow);
      moveFlow.start$.next({ direction: CompassDirection.E, movingId });
      expect(moved).toEqual(false);
      expect(attacked).toEqual(true);
      expect(noAction).toEqual(false);
      expect(finished).toEqual(true);
    });
  });
});
