import {
  dijkstra,
  GridPos,
  GridPosData,
  LightSource,
  Physical,
  Renderable,
  Size,
} from '@rad/rl-ecs';
import { CaveLevelTemplate, CavePlacer, Pos2d } from '@rad/rl-procgen';
import {
  popRandomElement,
  randomElement,
  randomInt,
  ValueMap,
} from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { randomItem } from './base-prefabs';
import {
  ghoulPrefab,
  giantCentipedePrefab,
  giantSpiderPrefab,
  lichenPrefab,
  ogrePrefab,
  ratPrefab,
} from './entity-prefabs';

export function createCaveTemplate(
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
      const roll = randomInt(1, 100);
      if (roll > 85) {
        return em.create(new GridPos(pos), ...ghoulPrefab(playerId, em)).id;
      } else if (roll > 70) {
        return em.create(new GridPos(pos), ...ogrePrefab(playerId, em)).id;
      } else if (roll > 50) {
        return em.create(
          new GridPos(pos),
          ...giantCentipedePrefab(playerId, em)
        ).id;
      } else if (roll > 40) {
        return em.create(new GridPos(pos), ...lichenPrefab(playerId, em)).id;
      } else if (roll > 10) {
        return em.create(new GridPos(pos), ...giantSpiderPrefab(playerId, em))
          .id;
      } else {
        return em.create(new GridPos(pos), ...ratPrefab(playerId, em)).id;
      }
    },
    itemGenerator: (pos) => {
      return randomItem(
        {
          bigBoyStunGrenade: 20,
          smallStunGrenade: 40,
          healingSalve: 30,
          bigBoyFlameGrenade: 20,
          smallFlameGrenade: 40,
          equippable: 20,
        },
        em,
        pos
      );
    },
    placers: [
      new CavePlacer((em, depth, { takenMap, openList }) => {
        if (!openList.length) {
          return;
        }
        let chosenPos: Pos2d;
        do {
          chosenPos = randomElement(openList);
        } while (takenMap.has(chosenPos));

        em.create(
          new GridPos({ ...chosenPos, z: depth }),
          ...ratPrefab(playerId, em)
        );
      }),
      new CavePlacer((em, depth, { takenMap, openList }) => {
        if (!openList.length) {
          return;
        }
        const walkable = new ValueMap<GridPos, true>();
        for (const pos of openList) {
          walkable.set(new GridPos({ ...pos, z: 0 }), true);
        }
        const start = openList[0];
        const distances = dijkstra({ ...start, z: 0 }, (pos: GridPosData) =>
          walkable.has(new GridPos(pos))
        );
        const buckets: { [distance: number]: GridPos[] } = {};
        let maxDistance = 0;
        for (let [pos, distance] of distances) {
          distance = Math.floor(distance);
          buckets[distance] = buckets[distance] ?? [];
          buckets[distance].push(pos);
          maxDistance = Math.max(maxDistance, distance);
        }
        console.log(`bucket count: ${Object.entries(buckets).length}`);
        let skip = 0;
        for (let [, candidates] of Object.entries(buckets)) {
          ++skip;
          if (skip % 10 === 0) {
            const lights = Math.ceil(candidates.length / 20);
            for (let j = 0; j < lights; ++j) {
              const { x, y } = popRandomElement(candidates);
              const lightId = em.create(
                new GridPos({ x, y, z: depth }),
                new LightSource({ strength: [200, 200, 200] }),
                new Renderable({ image: 'Decor0-65.png', zOrder: 0 })
              ).id;
              takenMap.set(new Pos2d(x, y), lightId);
            }
          }
        }
      }),
    ],
  });
}
