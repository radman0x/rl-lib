import { Description, GridPos, Physical, Renderable, Size, Stone, Wounds } from '@rad/rl-ecs';
import { DungeonPlacer, TrollLevelTemplate } from '@rad/rl-procgen';
import {
  createBrightMinesNDAComponent,
  createOrangeDirtNDAComponent,
  createTileChasmNDAComponent,
} from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
import { EntityId, EntityManager } from 'rad-ecs';
import { createGameEntity } from '..';
import { createTroll } from './agent-creators';

export function createTrollDen(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new TrollLevelTemplate({
    wall: (em, ...extras) =>
      em.create(
        createBrightMinesNDAComponent('troll-fill'),
        new Description({ short: 'earth' }),
        new Physical({ size: Size.FILL }),
        new Stone(),
        new Wounds({ current: 1, max: 1, deathDesc: 'cleared' }),
        ...extras
      ).id,

    wallFloor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-391.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    roomFloor: (em, ...extras) =>
      em.create(createOrangeDirtNDAComponent(), new Physical({ size: Size.FILL }), ...extras).id,
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
        const pos = openList[1];
        createGameEntity(em, createTroll(playerId), { ...pos, z: depth });
      }),
    ],
  });
}
