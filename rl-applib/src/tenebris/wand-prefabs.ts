import {
  Animation,
  AreaOfEffect,
  Bang,
  Charges,
  Description,
  Effects,
  EnergyCost,
  GridPos,
  MemberOf,
  Physical,
  Renderable,
  Size,
  Targeted,
  Usable,
} from '@rad/rl-ecs';
import { Flame } from 'libs/rl-ecs/src/lib/components/flame.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { Component, EntityId, EntityManager } from 'rad-ecs';

export interface WandOptions {
  strength: number;
  itemDescription: string;
  effectDescription: string;
  animation: string;
  image: string;
  radius: number;
  effectComponents: Component[];
  charges: number;
}

export function createWand(em: EntityManager, options: WandOptions, pos?: GridPos): EntityId {
  const effect = em.create(
    new Targeted({ range: 4 }),
    new Animation({ name: options.animation, speed: 0.25, scale: 0.5 }),
    new Usable({ useName: 'zap' }),
    new EnergyCost({ amount: 1 }),
    new Description({ short: options.effectDescription }),
    ...options.effectComponents
  ).id;
  if (options.radius === 0) {
    em.setComponent(effect, new SingleTarget({}));
  } else {
    em.setComponent(effect, new AreaOfEffect({ radius: options.radius }));
  }

  const Wand = em.create(
    new Description({
      short: options.itemDescription,
      typeId: options.itemDescription.replace(' ', '-'),
    }),
    new Renderable({
      image: options.image,
      zOrder: 5,
      uiImage: `assets/interface/${options.image}`,
    }),
    new Physical({ size: Size.SMALL }),
    new Charges({ curr: options.charges, max: options.charges }),
    new Effects({ contents: [effect] })
  ).id;
  if (pos) {
    em.setComponent(Wand, pos);
  }

  em.setComponent(effect, new MemberOf({ id: Wand, component: Effects, property: 'contents' }));

  return Wand;
}

export function createSmallFlameWand(em: EntityManager, pos?: GridPos): EntityId {
  return createWand(
    em,
    {
      itemDescription: 'flame wand',
      image: 'Wand-0.png',
      animation: 'explosionV007effect',
      effectDescription: 'erupts in a pillar of flame!',
      strength: 5,
      radius: 0,
      effectComponents: [new Flame({ strength: 3 })],
      charges: 2,
    },
    pos
  );
}

export function createBigBoyFlameWand(em: EntityManager, pos?: GridPos): EntityId {
  return createWand(
    em,
    {
      itemDescription: 'big boy flame wand',
      image: 'Wand-1.png',
      animation: 'explosionV007effect',
      effectDescription: 'erupts in a fire storm!',
      strength: 5,
      radius: 1,
      effectComponents: [new Flame({ strength: 2 })],
      charges: 2,
    },
    pos
  );
}

export function createSmallStunWand(em: EntityManager, pos?: GridPos): EntityId {
  return createWand(
    em,
    {
      itemDescription: 'stun wand',
      image: 'Wand-2.png',
      animation: 'explosionV002effect',
      effectDescription: 'pops with a boom!',
      strength: 5,
      radius: 0,
      effectComponents: [new Bang({ strength: 5 })],
      charges: 2,
    },
    pos
  );
}

export function createBigBoyStunWand(em: EntityManager, pos?: GridPos): EntityId {
  return createWand(
    em,
    {
      itemDescription: 'big boy stun wand',
      image: 'Wand-3.png',
      animation: 'explosionV002effect',
      effectDescription: 'slams out an epic concussive blast!',
      strength: 5,
      radius: 1,
      effectComponents: [new Bang({ strength: 5 })],
      charges: 2,
    },
    pos
  );
}
