import { GridPos, LightSource, Physical, Renderable, Size } from '@rad/rl-ecs';
import { DungeonLevelTemplate, DungeonPlacer, Pos2d } from '@rad/rl-procgen';
import { randomInt } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { randomItem } from './base-prefabs';
import {
  giantCentipedePrefab,
  giantSpiderPrefab,
  lichenPrefab,
  ratPrefab,
  zombiePrefab,
} from './entity-prefabs';

export function createDungeonTemplate(
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
    width,
    height,
    upTransitionTexture: 'Tile-12.png',
    downTransitionTexture: 'Tile-13.png',
    enemyChance: 0.22,
    initialEnemyCount: 8,
    maxEnemyCount: 30,
    initialItemRange: { min: 3, max: 8 },
    enemyGenerator: (pos) => {
      const roll = randomInt(1, 100);
      if (roll > 85) {
        return em.create(new GridPos(pos), ...giantSpiderPrefab(playerId, em)).id;
      } else if (roll > 70) {
        return em.create(new GridPos(pos), ...giantCentipedePrefab(playerId, em)).id;
      } else if (roll > 40) {
        return em.create(new GridPos(pos), ...zombiePrefab(playerId, em)).id;
      } else if (roll > 30) {
        return em.create(new GridPos(pos), ...lichenPrefab(playerId, em)).id;
      } else {
        return em.create(new GridPos(pos), ...ratPrefab(playerId, em)).id;
      }
    },
    itemGenerator: (pos) => {
      return randomItem(
        {
          bigBoyStunGrenade: 10,
          smallStunGrenade: 30,
          healingSalve: 20,
          bigBoyFlameGrenade: 9,
          smallFlameGrenade: 20,
          equippable: 7,
        },
        em,
        pos
      );
    },
    placers: [
      new DungeonPlacer((em, depth, { rooms, takenMap }) => {
        for (let room of rooms) {
          let [x, y] = room.getCenter();
          let lightPos = new Pos2d(x, y);
          while (takenMap.has(lightPos)) {
            ++x;
            lightPos = new Pos2d(x, y);
          }

          const lightId = em.create(
            new GridPos({ x, y, z: depth }),
            new LightSource({ strength: [200, 200, 200] }),
            new Renderable({ image: 'Decor0-65.png', zOrder: 6 })
          ).id;
          takenMap.set(new Pos2d(x, y), lightId);
        }
      }),
    ],
  });
}
