import { Physical, Renderable, Size } from '@rad/rl-ecs';
import { DungeonLevelTemplate } from '@rad/rl-procgen';
import { EntityId, EntityManager } from 'rad-ecs';

export function createUpperMineTemplate(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new DungeonLevelTemplate({
    wall: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-295.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    floor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-192.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    corridor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-206.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    door: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Tile-18.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    fill: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Wall-227.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    chasm: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Pit-18.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    width,
    height,
    upTransitionTexture: 'Tile-12.png',
    downTransitionTexture: 'Tile-13.png',
    enemyChance: 0.22,
    initialEnemyCount: 8,
    maxEnemyCount: 30,
    initialItemRange: { min: 3, max: 8 },
    enemyGenerator: (pos) => 0,
    itemGenerator: (pos) => 0,
    placers: [],
  });
}
