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
  let start$: Subject<
    CombatTargetEntity &
      MovingEntity &
      TargetPos &
      CanStandAtOut &
      CanOccupyPositionOut & { aggressorId: EntityId | null }
  >;
  let error: boolean | string;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    targetPos = { x: 0, y: 1, z: 0 };
    start$ = new Subject();
    error = false;
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
    let out: any;
    let rand = new Chance();
    start$
      .pipe(resolveBump(em, rand))
      .subscribe({ next: msg => (out = msg), error: err => (error = err) });
    start$.next({
      movingId,
      aggressorId: null,
      combatTargetId: null,
      canStand: true,
      canOccupy: true,
      targetPos
    });
    expect(error).toEqual(false);
    expect(out).toMatchObject({
      damage: null,
      damageTargetId: null,
      strikeSuccess: null,
      woundSuccess: null,
      spatial: { newPos: targetPos, movingId }
    });
  });

  it('should produce correct data when combat results in a hit only', () => {
    let out: any;
    let rand = new Chance(3);
    start$
      .pipe(resolveBump(em, rand))
      .subscribe({ next: msg => (out = msg), error: err => (error = err) });
    start$.next({
      movingId,
      aggressorId,
      combatTargetId,
      canStand: null,
      canOccupy: null,
      targetPos: null
    });
    expect(error).toEqual(false);
    expect(out).toMatchObject({
      damage: null,
      damageTargetId: null,
      strikeSuccess: true,
      woundSuccess: false,
      spatial: null
    });
  });

  it('should produce correct data when combat results in a hit and a wound', () => {
    let out: any;
    let rand = new Chance(4);
    start$
      .pipe(resolveBump(em, rand))
      .subscribe({ next: msg => (out = msg), error: err => (error = err) });
    start$.next({
      movingId,
      aggressorId,
      combatTargetId,
      canStand: null,
      canOccupy: null,
      targetPos: null
    });
    expect(error).toEqual(false);
    expect(out).toMatchObject({
      damage: {
        amount: 1,
        type: DamageType.PHYSICAL
      },
      damageTargetId: combatTargetId,
      strikeSuccess: true,
      woundSuccess: true,
      spatial: null
    });
  });
});
