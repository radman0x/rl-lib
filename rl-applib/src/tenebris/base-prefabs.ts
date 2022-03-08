import {
  Alignment,
  AlignmentType,
  ApproachTarget,
  Attacks,
  Description,
  GridPos,
  Knowledge,
  Mental,
  MentalState,
  Mobile,
  MovingAgent,
  Sighted,
  Speed,
  Wounds,
} from '@rad/rl-ecs';
import { ValueMap } from '@rad/rl-utils';
import { Strength } from 'libs/rl-ecs/src/lib/components/strength.model';
import { Toughness } from 'libs/rl-ecs/src/lib/components/toughness.model';
import { WeaponSkill } from 'libs/rl-ecs/src/lib/components/weapon-skill.model';
import { Component, EntityId, EntityManager } from 'rad-ecs';
import { createHealingSalve } from './entity-prefabs';
import {
  createMakeshiftClub,
  createRustySword,
  createLongSword,
  createWeapon,
  createHalberd,
  createTwoHandedSword,
  createShortSword,
  createHeavyArmor,
  createLightArmor,
  createPlateArmor,
} from './equippable-prefabs';
import {
  createBigBoyStunGrenade,
  createSmallStunGrenade,
  createBigBoyFlameGrenade,
  createSmallFlameGrenade,
} from './grenade-prefabs';

export interface BasicStats {
  weaponSkill: number;
  strength: number;
  toughness: number;
  wounds: number;
  attackDamage: number;
  sightRange: number;
  speed?: number;
}

export function baseAgent(
  playerId: EntityId,
  description: string,
  attackDesc: string,
  stats: BasicStats
): Component[] {
  const components = [
    new Sighted({ range: stats.sightRange }),
    new Knowledge({ current: new ValueMap(), history: new ValueMap() }),
    new Strength({ count: stats.strength }),
    new Toughness({ count: stats.toughness }),
    new WeaponSkill({ count: stats.weaponSkill }),
    new Wounds({ current: stats.wounds, max: stats.wounds }),
    new Attacks({ damage: stats.attackDamage, description: attackDesc }),
    new ApproachTarget({ targetId: playerId }),
    new Alignment({ type: AlignmentType.EVIL }),
    new MovingAgent({}),
    new Description({ short: description }),
  ];
  stats.speed = stats.speed ?? 1;
  stats.speed && components.push(new Mobile({ range: 1 }));
  stats.speed &&
    components.push(
      new Speed({
        actionCost: 1,
        currActionPoints: Math.random() >= 0.5 ? 1 : 0,
        recoupAmount: stats.speed,
      })
    );
  return components;
}

type EquippableNames =
  | 'makeshiftClub'
  | 'rustySword'
  | 'shortSword'
  | 'longSword'
  | 'twoHandedSword'
  | 'halberd'
  | 'lightArmor'
  | 'heavyArmor'
  | 'plateArmor';

export type RandomEquippableOptions = Partial<Record<EquippableNames, number>>;

const EQUIPPABLE_GENERATORS: Record<
  EquippableNames,
  (em: EntityManager, pos: GridPos) => EntityId
> = {
  makeshiftClub: (em, pos) => em.create(...createMakeshiftClub(pos)).id,
  rustySword: (em, pos) => em.create(...createRustySword(pos)).id,
  shortSword: (em, pos) => em.create(...createShortSword(pos)).id,
  longSword: (em, pos) => em.create(...createLongSword(pos)).id,
  halberd: (em, pos) => em.create(...createHalberd(pos)).id,
  twoHandedSword: (em, pos) => em.create(...createTwoHandedSword(pos)).id,
  lightArmor: (em, pos) => em.create(...createLightArmor(pos)).id,
  heavyArmor: (em, pos) => em.create(...createHeavyArmor(pos)).id,
  plateArmor: (em, pos) => em.create(...createPlateArmor(pos)).id,
};

export function randomEquippable(
  options: RandomEquippableOptions,
  em: EntityManager,
  pos?: GridPos
) {
  const total = Object.values(options).reduce((acc, curr) => acc + curr, 0);
  if (total === 0) {
    throw Error(`Specify at least one item weight!`);
  }
  const ranges: { [name: string]: [number, number] } = {};
  let lastMax = 0;
  for (let [name, weight] of Object.entries(options)) {
    const range = weight / total;
    ranges[name] = [lastMax, lastMax + range];
    lastMax += range;
  }
  const roll = Math.random();
  const toGen = Object.entries(ranges)
    .filter(([, [min, max]]) => roll >= min && roll <= max)
    .map(([name]) => name)
    .pop();
  return EQUIPPABLE_GENERATORS[toGen](em, pos);
}

type ItemNames =
  | 'healingSalve'
  | 'smallStunGrenade'
  | 'bigBoyStunGrenade'
  | 'smallFlameGrenade'
  | 'bigBoyFlameGrenade'
  | 'equippable';

export type RandomItemOptions = Partial<Record<ItemNames, number>>;

const ITEM_GENERATORS: Record<ItemNames, (em: EntityManager, pos: GridPos) => EntityId> = {
  healingSalve: (em, pos) => createHealingSalve(em, pos),
  bigBoyStunGrenade: (em, pos) => createBigBoyStunGrenade(em, pos),
  smallStunGrenade: (em, pos) => createSmallStunGrenade(em, pos),
  bigBoyFlameGrenade: (em, pos) => createBigBoyFlameGrenade(em, pos),
  smallFlameGrenade: (em, pos) => createSmallFlameGrenade(em, pos),
  equippable: (em, pos) =>
    randomEquippable(
      {
        makeshiftClub: 5,
        rustySword: 25,
        shortSword: 25,
        longSword: 20,
        twoHandedSword: 15,
        halberd: 10,
        lightArmor: 40,
        heavyArmor: 15,
        plateArmor: 10,
      },
      em,
      pos
    ),
};

export function randomItem(options: RandomItemOptions, em: EntityManager, pos?: GridPos) {
  const total = Object.values(options).reduce((acc, curr) => acc + curr, 0);
  if (total === 0) {
    throw Error(`Specify at least one item weight!`);
  }
  const ranges: { [name: string]: [number, number] } = {};
  let lastMax = 0;
  for (let [name, weight] of Object.entries(options)) {
    const range = weight / total;
    ranges[name] = [lastMax, lastMax + range];
    lastMax += range;
  }
  const roll = Math.random();
  const toGen = Object.entries(ranges)
    .filter(([, [min, max]]) => roll >= min && roll <= max)
    .map(([name]) => name)
    .pop();
  return ITEM_GENERATORS[toGen](em, pos);
}
