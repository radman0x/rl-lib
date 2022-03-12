import {
  Animation,
  BrightOreCost,
  Clotting,
  ClottingCost,
  Description,
  FleshySack,
  FleshySackCost,
  IronCost,
  Renderable,
  SlimeCost,
  TargetOrigin,
} from '@rad/rl-ecs';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { EntityManager } from 'rad-ecs';
import {
  createBeetlePoultice,
  createFlameGrenade,
  createGameEntity,
  createHealingSalve,
  createHealingSalvey,
  createHeavyArmor,
  createLightArmor,
  createPickAxe,
  createPlateArmor,
  createStunGrenade,
  EntityParts,
} from '..';

import {
  createHalberd,
  createLongSword,
  createRustySword,
  createShortSword,
  createTwoHandedSword,
} from '../tenebris/equippable-prefabs';

export function createPickAxeRecipe(em: EntityManager): EntityParts {
  const pickAxe = createGameEntity(em, createPickAxe());
  return {
    entity: [
      new Renderable({
        image: 'ShortWep-11.png',
        zOrder: 1,
        uiImage: 'assets/interface/ShortWep-11.png',
      }),
      new Description({ short: 'a pick-axe' }),
      new IronCost({ amount: 2 }),
      new SpawnEntity({ entities: [pickAxe], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createBeetlePoulticeRecipe(em: EntityManager): EntityParts {
  const beetlePoultice = createGameEntity(em, createBeetlePoultice());
  return {
    entity: [
      new Renderable({
        image: 'Food-15.png',
        zOrder: 1,
        uiImage: 'assets/interface/Food-15.png',
      }),
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Description({ short: 'beetle poultice' }),
      new ClottingCost({ amount: 3 }),
      new SpawnEntity({ entities: [beetlePoultice], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createHealingSalveRecipe(em: EntityManager): EntityParts {
  const healingSalve = createGameEntity(em, createHealingSalvey());
  return {
    entity: [
      new Renderable({
        image: 'Food-39.png',
        zOrder: 1,
        uiImage: 'assets/interface/Food-39.png',
      }),
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Description({ short: 'healing salve' }),
      new ClottingCost({ amount: 2 }),
      new FleshySackCost({ amount: 2 }),
      new SlimeCost({ amount: 2 }),
      new IronCost({ amount: 1 }),
      new SpawnEntity({ entities: [healingSalve], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createFlameGrenadeRecipe(em: EntityManager): EntityParts {
  const grenade = createGameEntity(em, createFlameGrenade());
  const image = 'Potion-2.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'flame grenade' }),
      new ClottingCost({ amount: 2 }),
      new FleshySackCost({ amount: 2 }),
      new SpawnEntity({ entities: [grenade], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createStunGrenadeRecipe(em: EntityManager): EntityParts {
  const grenade = createGameEntity(em, createStunGrenade());
  const image = 'Potion-7.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'stun grenade' }),
      new FleshySackCost({ amount: 2 }),
      new SlimeCost({ amount: 2 }),
      new SpawnEntity({ entities: [grenade], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createLightArmorRecipe(em: EntityManager): EntityParts {
  const armor = createGameEntity(em, { entity: createLightArmor() });
  const image = 'Armor-36.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Light armor' }),
      new IronCost({ amount: 5 }),
      new SpawnEntity({ entities: [armor], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createHeavyArmorRecipe(em: EntityManager): EntityParts {
  const armor = createGameEntity(em, { entity: createHeavyArmor() });
  const image = 'Armor-41.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Heavy armor' }),
      new IronCost({ amount: 20 }),
      new SpawnEntity({ entities: [armor], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createPlateArmorRecipe(em: EntityManager): EntityParts {
  const armor = createGameEntity(em, { entity: createPlateArmor() });
  const image = 'Armor-42.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Plate armor' }),
      new BrightOreCost({ amount: 10 }),
      new SpawnEntity({ entities: [armor], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createRustySwordRecipe(em: EntityManager): EntityParts {
  const weapon = createGameEntity(em, { entity: createRustySword() });
  const image = 'LongWep-8.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Rusty sword' }),
      new IronCost({ amount: 3 }),
      new SpawnEntity({ entities: [weapon], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createShortSwordRecipe(em: EntityManager): EntityParts {
  const weapon = createGameEntity(em, { entity: createShortSword() });
  const image = 'LongWep-7.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Short sword' }),
      new IronCost({ amount: 8 }),
      new SpawnEntity({ entities: [weapon], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createLongSwordRecipe(em: EntityManager): EntityParts {
  const weapon = createGameEntity(em, { entity: createLongSword() });
  const image = 'LongWep-9.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Long sword' }),
      new IronCost({ amount: 12 }),
      new BrightOreCost({ amount: 2 }),
      new SpawnEntity({ entities: [weapon], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createTwoHandedSwordRecipe(em: EntityManager): EntityParts {
  const weapon = createGameEntity(em, { entity: createTwoHandedSword() });
  const image = 'LongWep-10.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Two-handed sword' }),
      new IronCost({ amount: 3 }),
      new BrightOreCost({ amount: 8 }),
      new SpawnEntity({ entities: [weapon], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}

export function createHalberdRecipe(em: EntityManager): EntityParts {
  const weapon = createGameEntity(em, { entity: createHalberd() });
  const image = 'LongWep-22.png';
  return {
    entity: [
      new Animation({ name: 'explosionV003effect', speed: 0.08, scale: 0.17 }),
      new Renderable({
        image,
        zOrder: 1,
        uiImage: `assets/interface/${image}`,
      }),
      new Description({ short: 'Halberd' }),
      new IronCost({ amount: 2 }),
      new BrightOreCost({ amount: 9 }),
      new SpawnEntity({ entities: [weapon], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}
