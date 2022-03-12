import {
  Description,
  dijkstra,
  GridPos,
  GridPosData,
  Inventory,
  LightSource,
  Physical,
  Renderable,
  Size,
  Stone,
  Wounds,
} from '@rad/rl-ecs';
import { CaveLevelTemplate, CavePlacer, Pos2d } from '@rad/rl-procgen';
import { popRandomElement, randomElement, randomInt, ValueMap } from '@rad/rl-utils';
import {
  createBlackOreNDAComponent,
  createBlackVolcanicNDAComponent,
  createDimCaveNDAComponent,
} from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
import { EntityId, EntityManager } from 'rad-ecs';
import { createGameEntity, createIronOre, randomChoice, weakAllItems } from '..';
import { createBeetle, createGnat, createSnail } from './agent-creators';
import { createAlchemyBench } from './feature-creators';

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
        createDimCaveNDAComponent('lower-mines-fill'),
        new Physical({ size: Size.FILL }),
        new Wounds({ current: 1, max: 1, deathDesc: 'destroyed' }),
        new Description({ short: 'earth' }),
        new Stone(),
        ...extras
      ).id,
    floor: (em, ...extras) =>
      em.create(createBlackVolcanicNDAComponent(), new Physical({ size: Size.FILL }), ...extras).id,
    fillFloor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-384.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    upTransitionTexture: 'Tile-12.png',
    downTransitionTexture: 'Tile-13.png',
    enemyChance: 0.18,
    initialEnemyCount: 7,
    maxEnemyCount: 20,
    initialItemRange: { min: 2, max: 3 },
    enemyGenerator: (pos) => {
      const chosen = randomChoice([
        { weight: 1, choice: createBeetle(playerId) },
        { weight: 1, choice: createSnail(playerId) },
        { weight: 1, choice: createGnat(playerId) },
      ]);
      return createGameEntity(em, chosen, pos);
    },
    itemGenerator: (pos) => {
      const choice = randomChoice(weakAllItems());
      return createGameEntity(em, choice, pos);
    },
    placers: [
      new CavePlacer((em, depth, { takenMap, openList, fillWallList }) => {
        if (Math.random() <= 0.5) {
          const pos = randomElement(openList);
          createGameEntity(em, createAlchemyBench(em), new GridPos({ ...pos, z: depth }));
        }
      }),
      new CavePlacer((em, depth, { takenMap, openList, fillWallList }) => {
        const oreCount = randomInt(5, 10);
        for (let i = 0; i < oreCount; ++i) {
          const pos = popRandomElement(fillWallList);
          createGameEntity(
            em,
            {
              entity: [
                createBlackOreNDAComponent('lower-mines-fill'),
                new Stone(),
                new Wounds({ current: 1, max: 1, deathDesc: 'deposited on the ground' }),
                new Description({ short: 'iron ore' }),
              ],
              items: [createIronOre()],
            },
            new GridPos({ ...pos, z: depth })
          );
        }
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
        let skip = 0;
        for (let [, candidates] of Object.entries(buckets)) {
          ++skip;
          if (skip % 5 === 0) {
            const lights = Math.ceil(candidates.length / 20);
            for (let j = 0; j < lights; ++j) {
              const { x, y } = popRandomElement(candidates);
              const lightId = em.create(
                new GridPos({ x, y, z: depth }),
                new LightSource({ strength: [255, 255, 255] }),
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
