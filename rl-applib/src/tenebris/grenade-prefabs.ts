import {
  GridPos,
  Targeted,
  Usable,
  EnergyCost,
  Description,
  AreaOfEffect,
  Renderable,
  Physical,
  Size,
  Consumable,
  Effects,
  MemberOf,
  Bang,
  Animation,
} from '@rad/rl-ecs';
import { Flame } from 'libs/rl-ecs/src/lib/components/flame.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { EntityManager, EntityId, Component } from 'rad-ecs';

export interface GrenadeOptions {
  strength: number;
  itemDescription: string;
  effectDescription: string;
  animation: string;
  image: string;
  radius: number;
  effectComponents: Component[];
}

export function createGrenade(em: EntityManager, options: GrenadeOptions, pos?: GridPos): EntityId {
  const effect = em.create(
    new Targeted({ range: 4 }),
    new Animation({ name: options.animation, speed: 0.25, scale: 0.5 }),
    new Usable({ useName: 'throw' }),
    new EnergyCost({ amount: 1 }),
    new Description({ short: options.effectDescription }),
    ...options.effectComponents
  ).id;
  if (options.radius === 0) {
    em.setComponent(effect, new SingleTarget({}));
  } else {
    em.setComponent(effect, new AreaOfEffect({ radius: options.radius }));
  }

  const grenade = em.create(
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
    new Consumable({ uses: 1 }),
    new Effects({ contents: [effect] })
  ).id;
  if (pos) {
    em.setComponent(grenade, pos);
  }

  em.setComponent(effect, new MemberOf({ id: grenade, component: Effects, property: 'contents' }));

  return grenade;
}

export function createSmallFlameGrenade(em: EntityManager, pos?: GridPos): EntityId {
  return createGrenade(
    em,
    {
      itemDescription: 'flame grenade',
      image: 'Potion-19.png',
      animation: 'explosionV007effect',
      effectDescription: 'erupts in a pillar of flame!',
      strength: 5,
      radius: 0,
      effectComponents: [new Flame({ strength: 3 })],
    },
    pos
  );
}

export function createBigBoyFlameGrenade(em: EntityManager, pos?: GridPos): EntityId {
  return createGrenade(
    em,
    {
      itemDescription: 'big boy flame grenade',
      image: 'Potion-27.png',
      animation: 'explosionV007effect',
      effectDescription: 'erupts in a fire storm!',
      strength: 5,
      radius: 1,
      effectComponents: [new Flame({ strength: 2 })],
    },
    pos
  );
}

export function createSmallStunGrenade(em: EntityManager, pos?: GridPos): EntityId {
  return createGrenade(
    em,
    {
      itemDescription: 'stun grenade',
      image: 'Potion-21.png',
      animation: 'explosionV002effect',
      effectDescription: 'pops with a boom!',
      strength: 5,
      radius: 0,
      effectComponents: [new Bang({ strength: 5 })],
    },
    pos
  );
}

export function createBigBoyStunGrenade(em: EntityManager, pos?: GridPos): EntityId {
  return createGrenade(
    em,
    {
      itemDescription: 'big boy stun grenade',
      image: 'Potion-32.png',
      animation: 'explosionV002effect',
      effectDescription: 'slams out an epic concussive blast!',
      strength: 5,
      radius: 1,
      effectComponents: [new Bang({ strength: 5 })],
    },
    pos
  );
}
