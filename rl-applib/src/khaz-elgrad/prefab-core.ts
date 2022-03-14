import {
  Abilities,
  Alignment,
  AlignmentType,
  ApproachTarget,
  Attacks,
  DefenseSkill,
  Description,
  Effects,
  GridPos,
  GridPosData,
  Inventory,
  Knowledge,
  MemberOf,
  Mobile,
  MovingAgent,
  Physical,
  Recipes,
  Sighted,
  Size,
  Speed,
  Wounds,
} from '@rad/rl-ecs';
import { ValueMap } from '@rad/rl-utils';
import { Strength } from 'libs/rl-ecs/src/lib/components/strength.model';
import { Toughness } from 'libs/rl-ecs/src/lib/components/toughness.model';
import { WeaponSkill } from 'libs/rl-ecs/src/lib/components/weapon-skill.model';
import { Component, EntityId, EntityManager } from 'rad-ecs';
import {
  createBrightOre,
  createFlameGrenade,
  createFlameWand,
  createHalberd,
  createHealingSalvey,
  createHeavyArmor,
  createIronOre,
  createLightArmor,
  createLongSword,
  createPickAxe,
  createPlateArmor,
  createRichIronOre,
  createRustySword,
  createSandwich,
  createShortSword,
  createStunGrenade,
  createStunWand,
} from '..';

export interface BaseAgentStats {
  weaponSkill: number;
  defenseSkill?: number;
  strength: number;
  toughness: number;
  wounds: number;
  attackDamage: number;
  sightRange: number;
  speed?: number;
}

export function createBaseAgent(
  playerId: EntityId,
  description: string,
  attackDesc: string,
  stats: BaseAgentStats
): Component[] {
  const components = [
    new Sighted({ range: stats.sightRange }),
    new Knowledge({ current: new ValueMap(), history: new ValueMap() }),
    new Strength({ count: stats.strength }),
    new Toughness({ count: stats.toughness }),
    new WeaponSkill({ count: stats.weaponSkill }),
    new Wounds({ current: stats.wounds, max: stats.wounds, deathDesc: 'killed' }),
    new Attacks({ damage: stats.attackDamage, description: attackDesc }),
    new ApproachTarget({ targetId: playerId }),
    new Alignment({ type: AlignmentType.EVIL }),
    new MovingAgent({}),
    new Description({ short: description }),
    new Physical({ size: Size.MEDIUM }),
  ];
  if (stats.defenseSkill) {
    components.push(new DefenseSkill({ count: stats.defenseSkill }));
  }
  stats.speed = stats.speed ?? 1;
  components.push(new Mobile({ range: stats.speed }));
  components.push(
    new Speed({
      actionCost: 1,
      currActionPoints: Math.random() >= 0.5 ? 1 : 0,
      recoupAmount: stats.speed,
    })
  );
  return components;
}

export type Generator = () => EntityParts;
export type WeightedChoice<T> = { weight: number; choice: T };
export type Choices<T> = WeightedChoice<T>[];

export function randomChoice<T>(choices: Choices<T>) {
  const total = choices.map((e) => e.weight).reduce((acc, curr) => acc + curr, 0);
  if (total === 0) {
    throw Error(`Specify at least one weighted choice!`);
  }
  const ranges: { range: [number, number]; choice: T }[] = [];
  let lastMax = 0;
  for (let { choice, weight } of choices) {
    const range = weight / total;
    ranges.push({ range: [lastMax, lastMax + range], choice });
    lastMax += range;
  }
  const roll = Math.random();
  const chosen = ranges
    .filter(({ range: [min, max] }) => roll >= min && roll <= max)
    .map(({ choice }) => choice)
    .pop();
  return chosen;
}

export function weakAllItems() {
  const ALL_ITEMS: Choices<EntityParts> = [
    { weight: 0.1, choice: createPickAxe() },
    { weight: 0.1, choice: createBrightOre() },
    { weight: 0.3, choice: createRichIronOre() },
    { weight: 0.7, choice: createIronOre() },
    { weight: 0.2, choice: createSandwich() },
    { weight: 0.05, choice: createFlameWand() },
    { weight: 0.05, choice: createStunWand() },
    { weight: 0.3, choice: createFlameGrenade() },
    { weight: 0.2, choice: createHealingSalvey() },
    { weight: 0.3, choice: createStunGrenade() },
  ];
  return ALL_ITEMS;
}

export function moderateAllItems() {
  const ALL_ITEMS: Choices<EntityParts> = [
    { weight: 0.1, choice: createPickAxe() },
    { weight: 0.2, choice: createBrightOre() },
    { weight: 0.2, choice: createRichIronOre() },
    { weight: 0.4, choice: createIronOre() },
    { weight: 0.1, choice: createSandwich() },
    { weight: 0.1, choice: createFlameWand() },
    { weight: 0.1, choice: createStunWand() },
    { weight: 0.4, choice: createFlameGrenade() },
    { weight: 0.3, choice: createHealingSalvey() },
    { weight: 0.4, choice: createStunGrenade() },
  ];
  return ALL_ITEMS;
}

export function strongAllItems() {
  const ALL_ITEMS: Choices<EntityParts> = [
    { weight: 0.1, choice: createPickAxe() },
    { weight: 0.3, choice: createBrightOre() },
    { weight: 0.4, choice: createRichIronOre() },
    { weight: 0.1, choice: createIronOre() },
    { weight: 0.1, choice: createSandwich() },
    { weight: 0.15, choice: createFlameWand() },
    { weight: 0.15, choice: createStunWand() },
    { weight: 0.45, choice: createFlameGrenade() },
    { weight: 0.35, choice: createHealingSalvey() },
    { weight: 0.45, choice: createStunGrenade() },
  ];
  return ALL_ITEMS;
}

export type EntityParts = {
  entity: Component[];
  effects?: EntityParts[];
  items?: EntityParts[];
  abilities?: EntityParts[];
  recipes?: EntityParts[];
};

export function createGameEntity(
  em: EntityManager,
  parts: EntityParts,
  pos?: GridPosData,
  ...extras: Component[]
): EntityId {
  const { effects, items, abilities, recipes, entity } = parts;
  const effectIds =
    effects?.filter((p): p is EntityParts => !!p).map((effect) => createGameEntity(em, effect)) ??
    [];
  const itemIds =
    items?.filter((p): p is EntityParts => !!p).map((item) => createGameEntity(em, item)) ?? [];

  const abilityIds =
    abilities
      ?.filter((p): p is EntityParts => !!p)
      .map((ability) => createGameEntity(em, ability)) ?? [];

  const recipeIds =
    recipes?.filter((p): p is EntityParts => !!p).map((recipe) => createGameEntity(em, recipe)) ??
    [];

  const entityId = em.create(
    ...entity,
    new Effects({ contents: effectIds }),
    new Inventory({ contents: itemIds }),
    new Abilities({ contents: abilityIds }),
    new Recipes({ contents: recipeIds }),
    pos ? new GridPos(pos) : undefined,
    ...extras
  ).id;

  effectIds.forEach((id) =>
    em.setComponent(id, new MemberOf({ id: entityId, component: Effects, property: 'contents' }))
  );

  itemIds.forEach((id) =>
    em.setComponent(id, new MemberOf({ id: entityId, component: Inventory, property: 'contents' }))
  );

  abilityIds.forEach((id) =>
    em.setComponent(id, new MemberOf({ id: entityId, component: Abilities, property: 'contents' }))
  );

  recipeIds.forEach((id) =>
    em.setComponent(id, new MemberOf({ id: entityId, component: Recipes, property: 'contents' }))
  );

  return entityId;
}
