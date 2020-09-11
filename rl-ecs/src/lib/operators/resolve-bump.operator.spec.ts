import * as Chance from 'chance';
import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { Attacks } from '../components/attacks.model';
import { Martial } from '../components/martial.model';
import { GridPos, GridPosData } from '../components/position.model';
import { CanOccupyPositionOut } from '../mappers/can-occupy-position.system';
import { CanStandAtOut } from '../mappers/can-stand-at-position.system';
import {
  CombatTargetEntity,
  DamageType,
  MovingEntity,
  TargetPos
} from '../systems.types';
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
      new Martial({ strength: 1, toughness: 1, weaponSkill: 1 }),
      new Attacks({ damage: 1 })
    ).id;
    aggressorId = movingId;
    combatTargetId = em.create(
      new Martial({ strength: 1, toughness: 1, weaponSkill: 1 })
    ).id;
  });

  it('should produce correct data when a move can be completed', () => {
    let rand = new Chance();
    const out = resolveBump(
      {
        movingId,
        aggressorId: null,
        combatTargetId: null,
        isBlocked: null,
        canStand: true,
        canOccupy: true,
        targetPos
      },
      em,
      rand
    );
    expect(out).toMatchObject({
      damage: null,
      damageTargetId: null,
      strikeSuccess: null,
      woundSuccess: null,
      newPosition: targetPos,
      movingId
    });
  });

  it('should produce correct data when combat results in a hit only', () => {
    let rand = new Chance(3);
    const out = resolveBump(
      {
        movingId,
        aggressorId,
        combatTargetId,
        isBlocked: null,
        canStand: null,
        canOccupy: null,
        targetPos: null
      },
      em,
      rand
    );
    expect(out).toMatchObject({
      damage: null,
      damageTargetId: null,
      strikeSuccess: true,
      woundSuccess: false,
      newPosition: null
    });
  });

  it('should produce correct data when combat results in a hit and a wound', () => {
    let rand = new Chance(4);
    const out = resolveBump(
      {
        movingId,
        aggressorId,
        combatTargetId,
        isBlocked: null,
        canStand: null,
        canOccupy: null,
        targetPos: null
      },
      em,
      rand
    );
    expect(out).toMatchObject({
      damage: {
        amount: 1,
        type: DamageType.PHYSICAL
      },
      damageTargetId: combatTargetId,
      strikeSuccess: true,
      woundSuccess: true,
      newPosition: null
    });
  });
});
