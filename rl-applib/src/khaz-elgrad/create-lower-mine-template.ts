import { Physical, Renderable, Size } from '@rad/rl-ecs';
import { CaveLevelTemplate } from '@rad/rl-procgen';
import { EntityId, EntityManager } from 'rad-ecs';
import { createGameEntity, randomEntity } from '..';
import { createBeetle } from './agent-creators';

export function createLowerMineTemplate(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new CaveLevelTemplate({
    height,
    width,
    fill: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Wall-227.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    floor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-192.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    downTransitionTexture: 'Decor0-12.png',
    upTransitionTexture: 'Decor0-12.png',
    enemyChance: 0.27,
    initialEnemyCount: 10,
    maxEnemyCount: 40,
    initialItemRange: { min: 6, max: 11 },
    enemyGenerator: (pos) => {
      const chosen = randomEntity([{ weight: 1, generator: () => createBeetle(playerId) }]);
      return createGameEntity(em, chosen, pos);
    },
    itemGenerator: (pos) => 0,
    placers: [],
  });
}
