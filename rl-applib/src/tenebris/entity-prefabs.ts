import {
  Consumable,
  Description,
  Effects,
  EnergyCost,
  GridPos,
  Heal,
  Inventory,
  Lighting,
  LightPreference,
  MemberOf,
  Mental,
  MentalState,
  Physical,
  RandomMove,
  Renderable,
  Size,
  TargetOrigin,
  Usable,
} from '@rad/rl-ecs';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { Component, EntityId, EntityManager } from 'rad-ecs';
import { baseAgent, randomItem } from './base-prefabs';

export function ratPrefab(playerId: EntityId, em: EntityManager): Component[] {
  const items: EntityId[] = [];
  if (Math.random() >= 0.91) {
    items.push(createCheese(em));
  }
  return [
    ...baseAgent(playerId, 'rat', 'bite', {
      attackDamage: 1,
      sightRange: 8,
      strength: 1,
      toughness: 1,
      weaponSkill: 2,
      wounds: 1,
    }),
    new Renderable({ image: 'Rodent0-5.png', zOrder: 10 }),
    new LightPreference({
      threshold: Lighting.WELL_LIT,
      strength: -0.2,
      multiplier: 1.2,
    }),
    new RandomMove({ chance: 6 / 10, scoreAdjust: 1 }),
    new Mental({ state: MentalState.NORMAL }),
    new Inventory({ contents: items }),
  ];
}

export function zombiePrefab(playerId: EntityId, em): Component[] {
  const items: EntityId[] = [];
  if (Math.random() >= 0.9) {
    items.push(
      randomItem(
        {
          bigBoyStunGrenade: 5,
          smallStunGrenade: 40,
          bigBoyFlameGrenade: 5,
          smallFlameGrenade: 40,
          equippable: 5,
        },
        em
      )
    );
  }
  return [
    ...baseAgent(playerId, 'zombie', 'bite', {
      attackDamage: 1,
      sightRange: 3,
      strength: 1,
      toughness: 1,
      weaponSkill: 2,
      wounds: 2,
      speed: 0.5,
    }),
    new Renderable({ image: 'Undead0-13.png', zOrder: 10 }),
    new RandomMove({ chance: 1 / 10, scoreAdjust: 1 }),
  ];
}

export function lichenPrefab(playerId: EntityId, em: EntityManager): Component[] {
  const items: EntityId[] = [];
  if (Math.random() >= 0.5) {
    randomItem(
      {
        bigBoyStunGrenade: 10,
        smallStunGrenade: 10,
        bigBoyFlameGrenade: 10,
        smallFlameGrenade: 10,
        healingSalve: 100,
        equippable: 3,
      },
      em
    );
  }
  return [
    ...baseAgent(playerId, 'lichen', 'touches', {
      attackDamage: 1,
      sightRange: 1,
      strength: 1,
      toughness: 1,
      weaponSkill: 1,
      wounds: 1,
      speed: 0,
    }),
    new Renderable({ image: 'Slime0-3.png', zOrder: 10 }),
    new Inventory({ contents: items }),
  ];
}

export function giantSpiderPrefab(playerId: EntityId, em: EntityManager): Component[] {
  const items: EntityId[] = [];
  if (Math.random() >= 0.8) {
    items.push(
      randomItem(
        {
          bigBoyStunGrenade: 15,
          smallStunGrenade: 25,
          bigBoyFlameGrenade: 15,
          smallFlameGrenade: 25,
          healingSalve: 15,
          equippable: 10,
        },
        em
      )
    );
  }
  return [
    ...baseAgent(playerId, 'giant spider', 'bite', {
      attackDamage: 2,
      sightRange: 8,
      strength: 2,
      toughness: 3,
      weaponSkill: 3,
      wounds: 2,
    }),
    new LightPreference({
      threshold: Lighting.DIM,
      strength: -0.4,
      multiplier: 1.4,
    }),
    new Renderable({ image: 'Pest0-42.png', zOrder: 10 }),
    new RandomMove({ chance: 0.5 / 10, scoreAdjust: 1 }),
    new Mental({ state: MentalState.NORMAL }),
    new Inventory({ contents: items }),
  ];
}

export function ogrePrefab(playerId: EntityId, em: EntityManager): Component[] {
  const items: EntityId[] = [];
  if (Math.random() >= 0.5) {
    items.push(
      randomItem(
        {
          bigBoyStunGrenade: 25,
          smallStunGrenade: 10,
          bigBoyFlameGrenade: 20,
          smallFlameGrenade: 10,
          equippable: 20,
        },
        em
      )
    );
  }
  return [
    ...baseAgent(playerId, 'ogre', 'club', {
      attackDamage: 4,
      sightRange: 15,
      strength: 5,
      toughness: 4,
      weaponSkill: 4,
      wounds: 4,
      speed: 0.5,
    }),
    new LightPreference({
      threshold: Lighting.NORMAL,
      strength: -0.2,
      multiplier: 1.2,
    }),
    new Renderable({ image: 'Humanoid0-7.png', zOrder: 10 }),
    new RandomMove({ chance: 0.3 / 10, scoreAdjust: 0.5 }),
    new Mental({ state: MentalState.NORMAL }),
    new Inventory({ contents: items }),
  ];
}

export function ghoulPrefab(playerId: EntityId, em: EntityManager): Component[] {
  const items: EntityId[] = [];
  if (Math.random() >= 0.5) {
    items.push(
      randomItem(
        {
          bigBoyStunGrenade: 20,
          smallStunGrenade: 40,
          bigBoyFlameGrenade: 20,
          smallFlameGrenade: 40,
          equippable: 20,
        },
        em
      )
    );
  }
  return [
    ...baseAgent(playerId, 'ghoul', 'hit', {
      attackDamage: 2,
      sightRange: 12,
      strength: 3,
      toughness: 3,
      weaponSkill: 3,
      wounds: 2,
    }),
    new LightPreference({
      threshold: Lighting.DARK,
      strength: -0.5,
      multiplier: 1.4,
    }),
    new Renderable({ image: 'Undead0-24.png', zOrder: 10 }),
    new RandomMove({ chance: 0.5 / 10, scoreAdjust: 1 }),
    new Mental({ state: MentalState.NORMAL }),
    new Inventory({ contents: items }),
  ];
}

export function giantCentipedePrefab(playerId: EntityId, em: EntityManager): Component[] {
  const items: EntityId[] = [];
  if (Math.random() >= 0.8) {
    items.push(
      randomItem(
        {
          smallStunGrenade: 40,
          smallFlameGrenade: 40,
          equippable: 7,
        },
        em
      )
    );
  }
  return [
    ...baseAgent(playerId, 'centipede', 'bite', {
      attackDamage: 2,
      sightRange: 10,
      strength: 2,
      toughness: 2,
      weaponSkill: 3,
      wounds: 1,
    }),
    new LightPreference({
      threshold: Lighting.BRIGHT,
      strength: -0.5,
      multiplier: 1.2,
    }),
    new Renderable({ image: 'Pest0-20.png', zOrder: 10 }),
    new RandomMove({ chance: 0.7 / 10, scoreAdjust: 0.5 }),
    new Mental({ state: MentalState.NORMAL }),
    new Inventory({ contents: items }),
  ];
}

export function createCheese(em: EntityManager, pos?: GridPos): EntityId {
  const heal = em.create(
    new Usable({ useName: 'eat' }),
    new EnergyCost({ amount: 1 }),
    new Description({ short: 'is delicious!' }),
    new TargetOrigin({}),
    new SingleTarget({}),
    new Heal({ amount: 1 })
  ).id;

  const cheese = em.create(
    new Description({
      short: 'small cheese wheel',
      typeId: 'small-cheese-wheel',
    }),
    new Renderable({
      image: 'Cheese.png',
      zOrder: 5,
      uiImage: 'assets/interface/Cheese.png',
    }),
    new Physical({ size: Size.SMALL }),
    new Consumable({ uses: 1 }),
    new Effects({ contents: [heal] })
  ).id;
  if (pos) {
    em.setComponent(cheese, pos);
  }

  em.setComponent(heal, new MemberOf({ id: cheese, component: Effects, property: 'contents' }));

  return cheese;
}

export function createHealingSalve(em: EntityManager, pos?: GridPos): EntityId {
  const heal = em.create(
    new Usable({ useName: 'apply' }),
    new EnergyCost({ amount: 1 }),
    new Description({ short: 'is soothing!' }),
    new TargetOrigin({}),
    new SingleTarget({}),
    new Heal({ amount: 4 })
  ).id;

  const salve = em.create(
    new Description({ short: 'healing salve', typeId: 'healing-salve' }),
    new Renderable({
      image: 'Food-31.png',
      zOrder: 5,
      uiImage: 'assets/interface/Food-31.png',
    }),
    new Physical({ size: Size.SMALL }),
    new Consumable({ uses: 1 }),
    new Effects({ contents: [heal] })
  ).id;
  if (pos) {
    em.setComponent(salve, pos);
  }

  em.setComponent(heal, new MemberOf({ id: salve, component: Effects, property: 'contents' }));

  return salve;
}
