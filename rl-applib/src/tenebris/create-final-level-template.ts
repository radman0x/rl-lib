import { Physical, Renderable, Size } from '@rad/rl-ecs';
import { FinalLevelTemplate } from 'libs/rl-procgen/src/lib/final-level.model';
import { EntityId, EntityManager } from 'rad-ecs';

export function createFinalLevelTemplate(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new FinalLevelTemplate({
    height: Math.floor(height / 2),
    width: Math.floor(width / 2),
    floor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-103.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    fillFloor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-103.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    fill: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Tree0-147.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    downTransitionTexture: 'Decor0-12.png',
    upTransitionTexture: 'Decor0-12.png',
    enemyChance: 0.2,
    maxEnemyCount: 0,
    enemyGenerator: () => 0,
    itemGenerator: () => 0,
    initialEnemyCount: 0,
    initialItemRange: { min: 0, max: 0 },

    placers: [],
  });
}
