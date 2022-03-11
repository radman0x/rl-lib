import { Description, GridPos, Physical, Renderable, Size, Stone, Wounds } from '@rad/rl-ecs';
import { CavePlacer, DungeonPlacer, StaticLevelTemplate } from '@rad/rl-procgen';
import { popRandomElement, randomElement } from '@rad/rl-utils';
import {
  createSilverTileNDAComponent,
  createSilverWallNDAComponent,
  createTileChasmNDAComponent,
} from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
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
        createSilverWallNDAComponent('silver-wall'),
        new Physical({ size: Size.FILL }),
        new Wounds({ current: 1, max: 1, deathDesc: 'destroyed' }),
        new Description({ short: 'wall' }),
        new Stone(),
        ...extras
      ).id,

    wallFloor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-391.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    roomFloor: (em, ...extras) =>
      em.create(createSilverTileNDAComponent(), new Physical({ size: Size.FILL }), ...extras).id,
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
    chasm: (em, ...extras) => em.create(createTileChasmNDAComponent('tile-chasm'), ...extras).id,

    // em.create(new Renderable({ image: 'Pit0-18.png', zOrder: 1 }), ...extras).id,
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
    placers: [
      new DungeonPlacer((em, depth, { rooms, openList, takenMap }) => {
        const pos = randomElement(openList);
        const aesthetic = em.create(
          new GridPos({ ...pos, z: depth - 1 }),
          new Renderable({ image: 'Ground0-4.png', image2: 'Ground1-4.png', zOrder: 3 })
        ).id;
        takenMap.set(pos, aesthetic);
      }),
    ],
  });
}
