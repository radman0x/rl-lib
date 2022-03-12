import {
  GridPos,
  Renderable,
  Physical,
  Size,
  Effects,
  Climbable,
  EndState,
  EndType,
  Stone,
  Wounds,
  Anvil,
  IronCost,
  Leverage,
  LeverageRemove,
  Description,
  TargetOrigin,
  LightSource,
  MithrilOreCost,
} from '@rad/rl-ecs';
import { Blockage } from 'libs/rl-ecs/src/lib/components/blockage.model';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { EntityManager } from 'rad-ecs';
import {
  createFlameGrenadeRecipe,
  createHalberdRecipe,
  createHealingSalveRecipe,
  createHeavyArmorRecipe,
  createLightArmorRecipe,
  createLongSwordRecipe,
  createPlateArmorRecipe,
  createRustySwordRecipe,
  createShortSwordRecipe,
  createStunGrenadeRecipe,
  createTwoHandedSwordRecipe,
  EntityParts,
} from '..';

export function createSingleWallLight(visible: boolean = true): EntityParts {
  return {
    entity: [
      visible && new Renderable({ image: 'Decor0-63.png', image2: 'Decor1-63.png', zOrder: 5 }),
      new Physical({ size: Size.SMALL }),
      new Fixed({}),
      new LightSource({ strength: [200, 200, 200] }),
    ],
  };
}

export function createDoubleWallLight(): EntityParts {
  return {
    entity: [
      new Renderable({ image: 'Decor0-64.png', image2: 'Decor1-64.png', zOrder: 5 }),
      new Physical({ size: Size.SMALL }),
      new Fixed({}),
      new LightSource({ strength: [255, 255, 255] }),
    ],
  };
}

export function createWeaponBench(em: EntityManager): EntityParts {
  return {
    entity: [
      new Renderable({ image: 'Decor0-50.png', zOrder: 1 }),
      new Physical({ size: Size.MEDIUM }),
      new Fixed({}),
      new Anvil(),
      new Description({ short: 'weapon station' }),
    ],
    effects: [
      createRustySwordRecipe(em),
      createShortSwordRecipe(em),
      createLongSwordRecipe(em),
      createTwoHandedSwordRecipe(em),
      createHalberdRecipe(em),
      createLightArmorRecipe(em),
      createHeavyArmorRecipe(em),
      createPlateArmorRecipe(em),
    ],
  };
}

export function createAlchemyBench(em: EntityManager): EntityParts {
  return {
    entity: [
      new Renderable({ image: 'Decor0-53.png', zOrder: 1 }),
      new Physical({ size: Size.MEDIUM }),
      new Fixed({}),
      new Anvil(),
      new Description({ short: 'alchemy station' }),
    ],
    effects: [
      createStunGrenadeRecipe(em),
      createFlameGrenadeRecipe(em),
      createHealingSalveRecipe(em),
    ],
  };
}

export function createStrongholdAnvil(em: EntityManager): EntityParts {
  const crank = em.create(
    new Leverage({ power: 10 }),
    new LeverageRemove(),
    new Description({ short: 'mithril crank' }),
    new Renderable({ image: 'Tool-9.png', zOrder: 1, uiImage: 'assets/interface/Tool-9.png' }),
    new Physical({ size: Size.SMALL })
  ).id;

  return {
    entity: [
      new Renderable({ image: 'Decor0-51.png', zOrder: 1 }),
      new Physical({ size: Size.MEDIUM }),
      new Fixed({}),
      new Anvil(),
      new Description({ short: 'anvil station' }),
    ],
    effects: [
      {
        entity: [
          new MithrilOreCost({ amount: 3 }),
          new Renderable({
            image: 'Tool-9.png',
            zOrder: 1,
            uiImage: 'assets/interface/Tool-9.png',
          }),
          new SpawnEntity({ entities: [crank], replaceExisting: false }),
          new TargetOrigin({}),
          new SingleTarget(),
          new Description({ short: 'mithril crank' }),
        ],
      },
      createRustySwordRecipe(em),
      createShortSwordRecipe(em),
      createLongSwordRecipe(em),
      createTwoHandedSwordRecipe(em),
      createHalberdRecipe(em),
      createLightArmorRecipe(em),
      createHeavyArmorRecipe(em),
      createPlateArmorRecipe(em),
    ],
  };
}

export function createEndGameStairs(): EntityParts {
  return {
    entity: [
      new Renderable({ image: 'Tile-12.png', zOrder: 1 }),
      new Physical({ size: Size.MEDIUM }),
      new Fixed({}),
    ],
    effects: [{ entity: [new Climbable(), new EndState({ endType: EndType.VICTORY })] }],
  };
}

export function createImpassableBoulder(): EntityParts {
  return {
    entity: [
      new Renderable({ image: 'Rock-6.png', zOrder: 1 }),
      new Physical({ size: Size.FILL }),
      new Fixed({}),
    ],
  };
}
export function createDestructibleBoulder(): EntityParts {
  return {
    entity: [
      new Renderable({ image: 'Rock-7.png', zOrder: 1 }),
      new Physical({ size: Size.FILL }),
      new Stone(),
      new Wounds({ current: 1, max: 1, deathDesc: 'shattered' }),
      new Fixed({}),
    ],
  };
}

export function createLessFoodDisplay(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Decor0-36.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.LANGE }),
      new Fixed({}),
      new Blockage({ active: true, triggers: [] }),
    ],
  };
}

export function createFoodDisplay(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Decor0-35.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.LANGE }),
      new Fixed({}),
      new Blockage({ active: true, triggers: [] }),
    ],
  };
}

export function createRoundTable(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Decor0-57.png',
        image2: 'Decor1-57.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.LANGE }),
      new Fixed({}),
      new Blockage({ active: true, triggers: [] }),
    ],
  };
}

export enum BrownChairType {
  LEFT,
  RIGHT,
}
export function createBrownChair(type: BrownChairType): EntityParts {
  return {
    entity: [
      new Renderable({
        image: type === BrownChairType.LEFT ? 'Decor0-56.png' : 'Decor0-58.png',
        image2: type === BrownChairType.LEFT ? 'Decor1-56.png' : 'Decor1-58.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.LANGE }),
      new Fixed({}),
    ],
  };
}

export function createBedRoll(vertical: boolean): EntityParts {
  return {
    entity: [
      new Renderable({
        image: vertical ? 'Decor0-75.png' : 'Decor0-76.png',
        image2: vertical ? 'Decor1-75.png' : 'Decor1-76.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.LANGE }),
      new Fixed({}),
      new Blockage({ active: true, triggers: [] }),
    ],
  };
}

export function createBarSection(section: 1 | 2 | 3): EntityParts {
  const VARIANTS = {
    1: {
      image: 'Decor0-79.png',
      image2: 'Decor1-79.png',
    },
    2: {
      image: 'Decor0-80.png',
      image2: 'Decor1-80.png',
    },
    3: {
      image: 'Decor0-81.png',
      image2: 'Decor1-81.png',
    },
  };
  return {
    entity: [
      new Renderable({
        ...VARIANTS[section],
        zOrder: 1,
      }),
      new Physical({ size: Size.LANGE }),
      new Fixed({}),
      new Blockage({ active: true, triggers: [] }),
    ],
  };
}
