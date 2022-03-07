import { Physical, Renderable, Size } from '@rad/rl-ecs';
import { StaticLevelTemplate } from '@rad/rl-procgen';
import { EntityId, EntityManager } from 'rad-ecs';

export function createDwarfStronghold(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new StaticLevelTemplate({
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
      em.create(new Renderable({ image: 'Pit0-18.png', zOrder: 1 }), ...extras).id,
    width,
    height,
    upTransitionTexture: 'Tile-12.png',
    downTransitionTexture: 'Tile-13.png',
    enemyChance: 0.0,
    initialEnemyCount: 0,
    maxEnemyCount: 0,
    initialItemRange: { min: 0, max: 1 },
    enemyGenerator: (pos) => 0,
    itemGenerator: (pos) => 0,
    placers: [],
  });
}