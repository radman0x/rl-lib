import {
  Description,
  Dialogue,
  Lighting,
  LightPreference,
  Mental,
  MentalState,
  Mobile,
  MovingAgent,
  RandomMove,
  Renderable,
} from '@rad/rl-ecs';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { EntityId } from 'rad-ecs';
import {
  createBaseAgent,
  createBeetleScales,
  createFleshySack,
  createSlimyIchor,
  EntityParts,
  moderateAllItems,
  randomChoice,
  strongAllItems,
} from '..';

export function createDwarfKing(): EntityParts {
  return {
    entity: [
      new Description({ short: 'Barazak' }),
      new Renderable({ image: 'Player0-53.png', image2: 'Player1-53.png', zOrder: 10 }),
      new Mental({ state: MentalState.NORMAL }),
      new MovingAgent({}),
      new Dialogue({
        onceOff: [
          `We must mount an expedition to the lower mines for mithril ore!`,
          `Without access to the surface via the ancient bridge we're done for...`,
          `We have no access to our tools or stores, curse the quake! *Shakes fist*`,
        ],
        random: [
          {
            choice: `Use the anvil here with 'C' if you've materials to forge something!`,
            weight: 1,
          },
          { choice: `A pick-axe would be mighty useful!`, weight: 1 },
          { choice: `Barazak clenches and unclenches his hands anxiously`, weight: 1 },
          { choice: `Mithril ore has never been easy to come by, grumble`, weight: 1 },
          {
            choice: `Our only way out is through the upper mines across the ancient bridge`,
            weight: 1,
          },
        ],
      }),
    ],
    items: [],
  };
}

export function createDwarfEngineer(): EntityParts {
  return {
    entity: [
      new Description({ short: 'Brongir' }),
      new Renderable({ image: 'Player0-58.png', image2: 'Player1-58.png', zOrder: 10 }),
      new Mental({ state: MentalState.NORMAL }),
      new MovingAgent({}),
      new Dialogue({
        onceOff: [
          `If you try to activate the mechanism (press 'a'), you'll see what I mean, harumph!`,
          `To fix it we need a replacement mithril lever and we've none to hand!`,
          `Our mechanism to lower the bridge to the surface was badly damaged in the quake...`,
        ],
        random: [
          {
            choice: `If you try to activate the mechanism (press 'a'), you'll see it's broken, grumble, grumble`,
            weight: 1,
          },
          {
            choice: `Brongir stares intently at the bridge mechanism and waggles his eyebrows`,
            weight: 1,
          },
        ],
      }),
    ],
    items: [],
  };
}

export function createDwarfBarman(): EntityParts {
  return {
    entity: [
      new Description({ short: 'Kezzik' }),
      new Renderable({ image: 'Player0-55.png', image2: 'Player1-55.png', zOrder: 10 }),
      new Mental({ state: MentalState.NORMAL }),
      new MovingAgent({}),
      new Dialogue({
        onceOff: [
          `Greetings friend, can I offer you some food or an ale? We're all in this together!`,
        ],
        random: [
          { choice: `Kezzik grumbles comfortably to himself as he wipes the bar `, weight: 1 },
          { choice: `If we can't fix the drawbridge mechanism we're done for! `, weight: 1 },
          { choice: 'Our ale 🍺 stores are running low!', weight: 1 },
          { choice: 'That quake has really put us in a tight spot...', weight: 1 },
          { choice: 'Access to the armory is still blocked by a rockfall!', weight: 1 },
          {
            choice: `Every dwarf knows how to make a soothing beetle poultice, press 'C' and you'll see!`,
            weight: 1,
          },
          { choice: `Press 'A' to access your shove ability`, weight: 1 },
          {
            choice: 'Have you heard what they charge 💰 for an ale in Karak Fukalos? Outrageous!',
            weight: 0.5,
          },
        ],
      }),
    ],
    items: [],
  };
}

export function createBeetle(playerId: EntityId): EntityParts {
  const scales = createBeetleScales();
  const beetle = {
    entity: [
      ...createBaseAgent(playerId, 'beetle', 'gnaw', {
        attackDamage: 1,
        sightRange: 3,
        strength: 2,
        toughness: 1,
        weaponSkill: 2,
        defenseSkill: 0,
        wounds: 1,
      }),
      new Renderable({ image: 'Pest0-2.png', image2: 'Pest1-2.png', zOrder: 10 }),
      new RandomMove({ chance: 0.7 / 10, scoreAdjust: 2 }),
      new Mental({ state: MentalState.NORMAL }),
    ],
    items: [],
  };

  if (Math.random() >= 0.5) {
    beetle.items.push(scales);
  }
  return beetle;
}

export function createGnat(playerId: EntityId): EntityParts {
  const fleshySack = createFleshySack();
  const gnat = {
    entity: [
      ...createBaseAgent(playerId, 'gnat', 'stings', {
        attackDamage: 1,
        sightRange: 6,
        strength: 3,
        toughness: 0,
        weaponSkill: 2,
        defenseSkill: 1,
        wounds: 1,
        speed: 2,
      }),
      new Renderable({ image: 'Pest0-13.png', image2: 'Pest1-13.png', zOrder: 10 }),
      new RandomMove({ chance: 0.3 / 10, scoreAdjust: 1 }),
    ],
    items: [],
  };

  if (Math.random() >= 0.5) {
    gnat.items.push(fleshySack);
  }

  return gnat;
}
export function createSnail(playerId: EntityId): EntityParts {
  const slimyIchor = createSlimyIchor();
  const snail = {
    entity: [
      ...createBaseAgent(playerId, 'snail', 'slimes', {
        attackDamage: 1,
        sightRange: 3,
        strength: 3,
        toughness: 1,
        weaponSkill: 3,
        defenseSkill: 0,
        wounds: 2,
        speed: 0.25,
      }),
      new Renderable({ image: 'Pest0-38.png', image2: 'Pest1-38.png', zOrder: 10 }),
      new RandomMove({ chance: 0.1 / 10, scoreAdjust: 1 }),
    ],
    items: [],
  };

  if (Math.random() >= 0.5) {
    snail.items.push(slimyIchor);
  }

  return snail;
}

export function createGhoul(playerId: EntityId): EntityParts {
  const randomItem = randomChoice(strongAllItems());
  const ghoul = {
    entity: [
      ...createBaseAgent(playerId, 'ghoul', 'strikes', {
        attackDamage: 2,
        sightRange: 12,
        strength: 5,
        toughness: 3,
        weaponSkill: 4,
        defenseSkill: 2,
        wounds: 3,
      }),
      new LightPreference({
        threshold: Lighting.DARK,
        strength: -0.5,
        multiplier: 1.4,
      }),
      new Renderable({ image: 'Undead0-24.png', image2: 'Undead1-24.png', zOrder: 10 }),
      new RandomMove({ chance: 0.247 / 10, scoreAdjust: 1 }),
      new Mental({ state: MentalState.NORMAL }),
    ],
    items: [],
  };

  if (Math.random() <= 0.1) {
    ghoul.items.push(randomItem);
  }

  return ghoul;
}

export function createGremlin(playerId: EntityId): EntityParts {
  const randomItem = randomChoice(moderateAllItems());
  const gremlin = {
    entity: [
      ...createBaseAgent(playerId, 'gremlin', 'hit', {
        attackDamage: 1,
        sightRange: 10,
        strength: 3,
        toughness: 2,
        weaponSkill: 4,
        defenseSkill: 1,
        wounds: 3,
      }),
      new Renderable({ image: 'Misc0-7.png', image2: 'Misc1-7.png', zOrder: 10 }),
      new RandomMove({ chance: 0.3, scoreAdjust: 0.7 }),
      new Mental({ state: MentalState.NORMAL }),
    ],
    items: [],
  };
  if (Math.random() <= 0.1) {
    gremlin.items.push(randomItem);
  }
  return gremlin;
}

export function createDeformed(playerId: EntityId): EntityParts {
  const randomItem = randomChoice(moderateAllItems());
  const deformed = {
    entity: [
      ...createBaseAgent(playerId, 'deformed', 'hit', {
        attackDamage: 2,
        sightRange: 5,
        strength: 3,
        toughness: 2,
        weaponSkill: 4,
        defenseSkill: 2,
        wounds: 5,
        speed: 0.5,
      }),
      new Renderable({ image: 'Misc0-26.png', image2: 'Misc1-26.png', zOrder: 10 }),
      new RandomMove({ chance: 0.01, scoreAdjust: 0.5 }),
      new Mental({ state: MentalState.NORMAL }),
    ],
    items: [],
  };
  if (Math.random() <= 0.05) {
    deformed.items.push(randomItem);
  }
  return deformed;
}

export function createOrc(playerId: EntityId): EntityParts {
  const randomItem = randomChoice(strongAllItems());
  const orc = {
    entity: [
      ...createBaseAgent(playerId, 'orc', 'hit', {
        attackDamage: 2,
        sightRange: 10,
        strength: 5,
        toughness: 4,
        weaponSkill: 5,
        defenseSkill: 3,
        wounds: 2,
      }),
      new Renderable({ image: 'Humanoid0-27.png', image2: 'Humanoid1-27.png', zOrder: 10 }),
      new RandomMove({ chance: 0.1, scoreAdjust: 0.5 }),
      new Mental({ state: MentalState.NORMAL }),
    ],
    items: [],
  };
  if (Math.random() <= 0.15) {
    orc.items.push(randomItem);
  }
  return orc;
}

export function createTroll(playerId: EntityId): EntityParts {
  const randomItem = randomChoice(strongAllItems());
  const troll = {
    entity: [
      ...createBaseAgent(playerId, 'troll', 'club', {
        attackDamage: 3,
        sightRange: 10,
        strength: 6,
        toughness: 5,
        weaponSkill: 5,
        defenseSkill: 5,
        wounds: 9,
      }),
      new Renderable({ image: 'Undead0-7.png', image2: 'Undead1-7.png', zOrder: 10 }),
      new RandomMove({ chance: 0.1, scoreAdjust: 0.5 }),
      new Mental({ state: MentalState.NORMAL }),
      new Fixed({}),
    ],
    items: [],
  };
  if (Math.random() <= 0.6) {
    troll.items.push(randomItem);
  }
  return troll;
}
