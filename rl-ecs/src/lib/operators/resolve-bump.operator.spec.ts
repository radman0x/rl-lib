import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { Attacks } from '../components/attacks.model';
import { GridPos, GridPosData } from '../components/position.model';
import { Strength } from '../components/strength.model';
import { Toughness } from '../components/toughness.model';
import { WeaponSkill } from '../components/weapon-skill.model';
import { DamageType } from '../systems.types';
import { resolveBump } from './resolve-bump.operator';

describe('', () => {
  let em: EntityManager;
  let targetPos: GridPosData;
  let aggressorId: EntityId;
  let movingId: EntityId;
  let combatTargetId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    targetPos = { x: 0, y: 1, z: 0 };
    movingId = em.create(
      new Strength({ count: 1 }),
      new Toughness({ count: 1 }),
      new WeaponSkill({ count: 1 }),
      new Attacks({ damage: 1 })
    ).id;
    aggressorId = movingId;
    combatTargetId = em.create(
      new Strength({ count: 1 }),
      new Toughness({ count: 1 }),
      new WeaponSkill({ count: 1 })
    ).id;
  });

  it('should produce correct data when a move can be completed', () => {
    let rand = new Chance();
    let out: any;
    resolveBump(
      {
        movingId,
        aggressorId: null,
        combatTargetId: null,
        isBlocked: null,
        canStand: true,
        canOccupy: true,
        targetPos,
      },
      em,
      rand
    ).subscribe((msg) => (out = msg));
    expect(out).toMatchObject({
      damage: null,
      damageTargetId: null,
      strikeSuccess: null,
      woundSuccess: null,
      newPosition: targetPos,
      movingId,
    });
  });

  it('should produce correct data when combat results in a hit only', () => {
    let rand = new Chance(3);
    let out: any;
    resolveBump(
      {
        movingId,
        aggressorId,
        combatTargetId,
        isBlocked: null,
        canStand: null,
        canOccupy: null,
        targetPos: null,
      },
      em,
      rand
    ).subscribe((msg) => (out = msg));
    expect(out).toMatchObject({
      damage: null,
      damageTargetId: null,
      strikeSuccess: true,
      woundSuccess: false,
      newPosition: null,
    });
  });

  it('should produce correct data when combat results in a hit and a wound', () => {
    let rand = new Chance(4);
    let out: any;
    resolveBump(
      {
        movingId,
        aggressorId,
        combatTargetId,
        isBlocked: null,
        canStand: null,
        canOccupy: null,
        targetPos: null,
      },
      em,
      rand
    ).subscribe((msg) => (out = msg));
    expect(out).toMatchObject({
      damage: {
        amount: 1,
        type: DamageType.PHYSICAL,
      },
      damageTargetId: combatTargetId,
      strikeSuccess: true,
      woundSuccess: true,
      newPosition: null,
    });
  });
});
