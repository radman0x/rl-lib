import {
  Animation,
  Bang,
  BrightOre,
  BrightOreRemove,
  Charges,
  Clotting,
  Consumable,
  Description,
  EnergyCost,
  FleshySack,
  FleshySackRemove,
  Heal,
  Iron,
  Leverage,
  LeverageRemove,
  MithrilOre,
  MithrilOreCost,
  MithrilOreRemove,
  OnlySpecific,
  Physical,
  Renderable,
  Size,
  Slime,
  SlimeRemove,
  Stone,
  Targeted,
  TargetOrigin,
  Usable,
} from '@rad/rl-ecs';
import { randomInt } from '@rad/rl-utils';
import { Flame } from 'libs/rl-ecs/src/lib/components/flame.model';
import { RemoveSelfCondition } from 'libs/rl-ecs/src/lib/components/remove-self-condition.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { EntityManager } from 'rad-ecs';
import { createSingleUseSelfHealingEffect, EntityParts } from '..';

export function createMithrilOre(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Money-32.png',
        uiImage: 'assets/interface/Money-32.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new MithrilOre({ count: 1 }),
      new Description({ short: 'mithril ore', typeId: 'mithril-ore' }),
      new MithrilOreRemove(),
    ],
  };
}

export function createBrightOre(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Money-20.png',
        uiImage: 'assets/interface/Money-20.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new BrightOre({ count: 1 }),
      new Description({ short: 'bright ore', typeId: 'bright-ore' }),
      new BrightOreRemove(),
    ],
  };
}

export function createRichIronOre(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Money-21.png',
        uiImage: 'assets/interface/Money-21.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new Iron({ count: 3 }),
      new Description({ short: 'rich iron ore', typeId: 'rich-iron-ore' }),
      new RemoveSelfCondition({
        componentType: Iron,
        minimum: 1,
        property: 'count',
      }),
    ],
  };
}

export function createIronOre(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Money-21.png',
        uiImage: 'assets/interface/Money-21.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new Iron({ count: 1 }),
      new Description({ short: 'iron ore', typeId: 'iron-ore' }),
      new RemoveSelfCondition({
        componentType: Iron,
        minimum: 1,
        property: 'count',
      }),
    ],
  };
}

export function createPickAxe(): EntityParts {
  return {
    entity: [
      new Physical({ size: Size.SMALL }),
      new Renderable({
        image: 'ShortWep-16.png',
        zOrder: 5,
        uiImage: `assets/interface/ShortWep-16.png`,
      }),
      new Description({
        short: `pick-axe`,
      }),
    ],
    effects: [
      {
        entity: [
          new OnlySpecific({
            componentType: Stone,
          }),
          new SingleTarget({}),
          new Targeted({ range: 1 }),
          new Heal({ amount: -10 }),
          new Usable({ useName: 'excavate' }),
          new Description({
            short: `excavates`,
          }),
        ],
      },
    ],
  };
}

export function createSandwich(): EntityParts {
  return {
    entity: [
      new Physical({ size: Size.SMALL }),
      new Renderable({
        image: 'Food-32.png',
        zOrder: 5,
        uiImage: `assets/interface/Food-32.png`,
      }),
      new Description({
        short: `sandwich`,
      }),
      new Consumable({ uses: 1 }),
    ],
    effects: [
      createSingleUseSelfHealingEffect({ useName: 'eat', amount: 5, description: 'is delicious!' }),
    ],
  };
}

export function createBeetlePoultice(): EntityParts {
  return {
    entity: [
      new Physical({ size: Size.SMALL }),
      new Renderable({
        image: 'Food-15.png',
        uiImage: 'assets/interface/Food-15.png',
        zOrder: 5,
      }),
      new Description({ short: 'beetle poultice', typeId: 'beetle-poultice' }),
      new Consumable({ uses: 1 }),
    ],
    effects: [
      createSingleUseSelfHealingEffect({
        useName: 'apply',
        amount: 2,
        description: 'is soothing!',
      }),
    ],
  };
}

export function createHealingSalvey(): EntityParts {
  return {
    entity: [
      new Physical({ size: Size.SMALL }),
      new Renderable({
        image: 'Food-39.png',
        uiImage: 'assets/interface/Food-39.png',
        zOrder: 5,
      }),
      new Description({ short: 'healing salve', typeId: 'healing-salve' }),
      new Consumable({ uses: 1 }),
    ],
    effects: [
      createSingleUseSelfHealingEffect({
        useName: 'apply',
        amount: 5,
        description: 'is rejuvenating!',
      }),
    ],
  };
}

export function createBeetleScales(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Food-11.png',
        uiImage: 'assets/interface/Food-11.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new Description({ short: 'beetle scales', typeId: 'beetle-scales' }),
      new Clotting({ count: 1 }),
      new RemoveSelfCondition({
        componentType: Clotting,
        minimum: 1,
        property: 'count',
      }),
    ],
  };
}

export function createSlimyIchor(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Food-13.png',
        uiImage: 'assets/interface/Food-13.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new Description({ short: 'slimy ichor', typeId: 'slimy-ichor' }),
      new Slime({ count: 1 }),
      new SlimeRemove(),
    ],
  };
}

export function createFleshySack(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Food-8.png',
        uiImage: 'assets/interface/Food-8.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new Description({ short: 'fleshy sack', typeId: 'fleshy-sack' }),
      new FleshySack({ count: 1 }),
      new FleshySackRemove(),
    ],
  };
}

export function createStunGrenade(): EntityParts {
  const image = 'Potion-7.png';
  return {
    entity: [
      new Description({
        short: 'stun grenade',
        typeId: 'stun-grenade',
      }),
      new Renderable({
        image,
        zOrder: 5,
        uiImage: `assets/interface/${image}`,
      }),
      new Physical({ size: Size.SMALL }),
      new Consumable({ uses: 1 }),
    ],
    effects: [
      {
        entity: [
          new Targeted({ range: 4 }),
          new Animation({ name: 'explosionV001effect', speed: 0.25, scale: 0.1666 }),
          new SingleTarget(),
          new Usable({ useName: 'hurl' }),
          new EnergyCost({ amount: 1 }),
          new Description({ short: 'produces a white concussive flash' }),
          new Bang({ strength: 8 }),
        ],
      },
    ],
  };
}

export function createStunWand(): EntityParts {
  const chargeCount = randomInt(2, 5);
  const image = 'Wand-2.png';
  return {
    entity: [
      new Description({
        short: 'stun wand',
      }),
      new Renderable({
        image,
        zOrder: 5,
        uiImage: `assets/interface/${image}`,
      }),
      new Physical({ size: Size.SMALL }),
      new Charges({ curr: chargeCount, max: chargeCount }),
    ],
    effects: [
      {
        entity: [
          new Targeted({ range: 4 }),
          new Animation({ name: 'explosionV001effect', speed: 0.25, scale: 0.1666 }),
          new SingleTarget(),
          new Usable({ useName: 'zap' }),
          new EnergyCost({ amount: 1 }),
          new Description({ short: 'produces a white concussive flash' }),
          new Bang({ strength: 8 }),
        ],
      },
    ],
  };
}

export function createFlameWand(): EntityParts {
  const chargeCount = randomInt(2, 5);
  const image = 'Wand-33.png';
  return {
    entity: [
      new Description({
        short: 'flame wand',
      }),
      new Renderable({
        image,
        zOrder: 5,
        uiImage: `assets/interface/${image}`,
      }),
      new Physical({ size: Size.SMALL }),
      new Charges({ curr: chargeCount, max: chargeCount }),
    ],
    effects: [
      {
        entity: [
          new Targeted({ range: 4 }),
          new Animation({ name: 'explosionV007effect', speed: 0.25, scale: 0.5 }),
          new SingleTarget(),
          new Usable({ useName: 'zap' }),
          new EnergyCost({ amount: 1 }),
          new Description({ short: 'produces a stream of flame' }),
          new Flame({ strength: 2 }),
        ],
      },
    ],
  };
}

export function createFlameGrenade(): EntityParts {
  const image = 'Potion-2.png';
  return {
    entity: [
      new Description({
        short: 'flame grenade',
        typeId: 'flame-grenade',
      }),
      new Renderable({
        image,
        zOrder: 5,
        uiImage: `assets/interface/${image}`,
      }),
      new Physical({ size: Size.SMALL }),
      new Consumable({ uses: 1 }),
    ],
    effects: [
      {
        entity: [
          new Targeted({ range: 4 }),
          new Animation({ name: 'explosionV007effect', speed: 0.25, scale: 0.5 }),
          new SingleTarget(),
          new Usable({ useName: 'zap' }),
          new EnergyCost({ amount: 1 }),
          new Description({ short: 'produces a burst of flame' }),
          new Flame({ strength: 2 }),
        ],
      },
    ],
  };
}

export function createMithrilCrank(em: EntityManager): EntityParts {
  return {
    entity: [
      new Leverage({ power: 10 }),
      new LeverageRemove(),
      new Description({ short: 'mithril crank' }),
      new Renderable({ image: 'Tool-9.png', zOrder: 1, uiImage: 'assets/interface/Tool-9.png' }),
      new Physical({ size: Size.SMALL }),
    ],
  };
}
