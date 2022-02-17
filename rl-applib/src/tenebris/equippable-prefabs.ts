import {
  Description,
  GridPos,
  Physical,
  Renderable,
  Size,
  Wearable,
  Wieldable,
} from '@rad/rl-ecs';
import { ArmorDelta } from 'libs/rl-ecs/src/lib/components/armor-delta.model';
import { StrengthDelta } from 'libs/rl-ecs/src/lib/components/strength-delta.model';
import { WeaponSkillDelta } from 'libs/rl-ecs/src/lib/components/weapon-skill-delta.model';
import { EntityManager } from 'rad-ecs';

export interface ArmorOptions {
  armourAmount: number;
  description: string;
  image: string;
}
export function createArmor(options: ArmorOptions, pos?: GridPos) {
  let components = [
    new Description({ short: options.description }),
    new Renderable({
      image: options.image,
      zOrder: 5,
      uiImage: `assets/interface/${options.image}`,
    }),
    new Physical({ size: Size.SMALL }),
    new ArmorDelta({ change: options.armourAmount }),
    new Wearable({ slots: 1 }),
  ];
  return pos ? [...components, pos] : components;
}

export function createShirt(pos?: GridPos) {
  return createArmor(
    {
      armourAmount: 0,
      description: 'Shirt',
      image: 'Armor-48.png',
    },
    pos
  );
}

export function createLightArmor(pos?: GridPos) {
  return createArmor(
    {
      armourAmount: 1,
      description: 'Light armor',
      image: 'Armor-36.png',
    },
    pos
  );
}
export function createHeavyArmor(pos?: GridPos) {
  return createArmor(
    {
      armourAmount: 3,
      description: 'Heavy armor',
      image: 'Armor-38.png',
    },
    pos
  );
}

export function createPlateArmor(pos?: GridPos) {
  return createArmor(
    {
      armourAmount: 5,
      description: 'Platemail',
      image: 'Armor-41.png',
    },
    pos
  );
}

export interface WeaponOptions {
  strength: number;
  weaponSkill: number;
  image: string;
  description: string;
}
export function createWeapon(options: WeaponOptions, pos?: GridPos) {
  const components = [
    new WeaponSkillDelta({ change: options.weaponSkill }),
    new StrengthDelta({ change: options.strength }),
    new Description({ short: options.description }),
    new Wieldable({ slots: 1 }),
    new Renderable({
      image: options.image,
      zOrder: 5,
      uiImage: `assets/interface/${options.image}`,
    }),
    new Physical({ size: Size.SMALL }),
  ];

  return pos ? [...components, pos] : components;
}

export function createBoneShard(pos?: GridPos) {
  return createWeapon(
    {
      description: 'Bone shard',
      image: 'ShortWep-11.png',
      strength: 0,
      weaponSkill: 0,
    },
    pos
  );
}

export function createMakeshiftClub(pos?: GridPos) {
  return createWeapon(
    {
      description: 'Makeshift club',
      image: 'ShortWep-12.png',
      strength: 0,
      weaponSkill: 1,
    },
    pos
  );
}

export function createRustySword(pos?: GridPos) {
  return createWeapon(
    {
      description: 'Rusty sword',
      image: 'MedWep-1.png',
      strength: 0,
      weaponSkill: 2,
    },
    pos
  );
}

export function createShortSword(pos?: GridPos) {
  return createWeapon(
    {
      description: 'Short sword',
      image: 'LongWep-9.png',
      strength: 1,
      weaponSkill: 3,
    },
    pos
  );
}

export function createLongSword(pos?: GridPos) {
  return createWeapon(
    {
      description: 'Long sword',
      image: 'LongWep-7.png',
      strength: 1,
      weaponSkill: 4,
    },
    pos
  );
}

export function createTwoHandedSword(pos?: GridPos) {
  return createWeapon(
    {
      description: 'Two-handed Sword',
      image: 'LongWep-10.png',
      strength: 3,
      weaponSkill: 3,
    },
    pos
  );
}

export function createHalberd(pos?: GridPos) {
  return createWeapon(
    {
      description: 'Halberd',
      image: 'LongWep-22.png',
      strength: 2,
      weaponSkill: 4,
    },
    pos
  );
}
