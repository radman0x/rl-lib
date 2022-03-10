import {
  Alignment,
  AlignmentType,
  ApproachTarget,
  Attacks,
  Description,
  Effects,
  GridPos,
  GridPosData,
  Inventory,
  Knowledge,
  MemberOf,
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

export interface BaseAgentStats {
  weaponSkill: number;
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
  ];
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
export type WeightedGenerator = { weight: number; generator: Generator };
export type Generators = WeightedGenerator[];

export function randomEntity(generators: Generators) {
  const total = generators.map((e) => e.weight).reduce((acc, curr) => acc + curr, 0);
  if (total === 0) {
    throw Error(`Specify at least one item weight!`);
  }
  const ranges: { range: [number, number]; generator: Generator }[] = [];
  let lastMax = 0;
  for (let { generator, weight } of generators) {
    const range = weight / total;
    ranges.push({ range: [lastMax, lastMax + range], generator });
    lastMax += range;
  }
  const roll = Math.random();
  const chosenGenerator = ranges
    .filter(({ range: [min, max] }) => roll >= min && roll <= max)
    .map(({ generator }) => generator)
    .pop();
  return chosenGenerator();
}

export type EntityParts = { entity: Component[]; effects?: EntityParts[]; items?: EntityParts[] };

export function createGameEntity(
  em: EntityManager,
  parts: EntityParts,
  pos?: GridPosData
): EntityId {
  const { effects, items, entity } = parts;
  const effectIds =
    effects?.filter((p): p is EntityParts => !!p).map((effect) => createGameEntity(em, effect)) ??
    [];
  const itemIds =
    items?.filter((p): p is EntityParts => !!p).map((item) => createGameEntity(em, item)) ?? [];
  const entityId = em.create(
    ...entity,
    new Effects({ contents: effectIds }),
    new Inventory({ contents: itemIds }),
    pos ? new GridPos(pos) : undefined
  ).id;

  effectIds.forEach((id) =>
    em.setComponent(id, new MemberOf({ id: entityId, component: Effects, property: 'contents' }))
  );

  itemIds.forEach((id) =>
    em.setComponent(id, new MemberOf({ id: entityId, component: Inventory, property: 'contents' }))
  );

  return entityId;
}
