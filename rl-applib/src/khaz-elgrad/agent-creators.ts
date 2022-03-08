import { Mental, MentalState, RandomMove, Renderable } from '@rad/rl-ecs';
import { chanceFor } from '@rad/rl-utils';
import { EntityId } from 'rad-ecs';
import { createBaseAgent, createIronOre, EntityParts, randomEntity } from '..';

export function createBeetle(playerId: EntityId): EntityParts {
  return {
    entity: [
      ...createBaseAgent(playerId, 'beetle', 'gnaw', {
        attackDamage: 1,
        sightRange: 3,
        strength: 1,
        toughness: 1,
        weaponSkill: 0,
        wounds: 1,
      }),
      new Renderable({ image: 'Pest0-0.png', zOrder: 10 }),
      new RandomMove({ chance: 0.7 / 10, scoreAdjust: 2 }),
      new Mental({ state: MentalState.NORMAL }),
    ],
    items: [],
  };
}

export function createOrc(playerId: EntityId): EntityParts {
  return {
    entity: [
      ...createBaseAgent(playerId, 'orc', 'hit', {
        attackDamage: 1,
        sightRange: 10,
        strength: 5,
        toughness: 4,
        weaponSkill: 5,
        wounds: 1,
      }),
      new Renderable({ image: 'Humanoid0-27.png', zOrder: 10 }),
      new RandomMove({ chance: 0.1, scoreAdjust: 0.5 }),
      new Mental({ state: MentalState.NORMAL }),
    ],
    items: [],
  };
}
