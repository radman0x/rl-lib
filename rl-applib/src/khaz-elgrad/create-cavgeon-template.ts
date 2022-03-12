import {
  Description,
  dijkstra,
  GridPos,
  GridPosData,
  LightSource,
  Physical,
  Renderable,
  Size,
  Stone,
  Wounds,
} from '@rad/rl-ecs';
import { CavgeonLevelTemplate, CavgeonPlacer, DungeonLevelTemplate, Pos2d } from '@rad/rl-procgen';
import { ValueMap, popRandomElement, randomInt } from '@rad/rl-utils';
import {
  createBlackOreNDAComponent,
  createBrightOreNDAComponent,
  createDarkTileNDAComponent,
  createDimCaveNDAComponent,
  createDimMinesNDAComponent,
} from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
import { EntityId, EntityManager } from 'rad-ecs';
import {
  randomChoice,
  createGameEntity,
  createIronOre,
  createRichIronOre,
  createMithrilOre,
  createBrightOre,
  createStunWand,
  createFlameWand,
  createStunGrenade,
  createFlameGrenade,
  moderateAllItems,
} from '..';
import {
  createBeetle,
  createSnail,
  createGnat,
  createGhoul,
  createGremlin,
  createDeformed,
  createOrc,
} from './agent-creators';

export function createCavgeonTemplate(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new CavgeonLevelTemplate({
    wall: (em, ...extras) =>
      em.create(
        createDimMinesNDAComponent('lower-mines-fill'),
        new Physical({ size: Size.FILL }),
        new Wounds({ current: 1, max: 1, deathDesc: 'destroyed' }),
        new Description({ short: 'brick wall' }),
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
      em.create(createDarkTileNDAComponent(), new Physical({ size: Size.FILL }), ...extras).id,
    floor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-192.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    corridor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-384.png', zOrder: 1 }),
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
        createDimCaveNDAComponent('lower-mines-fill'),
        new Physical({ size: Size.FILL }),
        new Wounds({ current: 1, max: 1, deathDesc: 'destroyed' }),
        new Description({ short: 'wall' }),
        new Stone(),
        ...extras
      ).id,
    chasm: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Pit-18.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    fillFloor: (em, ...extras) =>
      em.create(
        new Renderable({ image: 'Floor-384.png', zOrder: 1 }),
        new Physical({ size: Size.FILL }),
        ...extras
      ).id,
    width,
    height,
    upTransitionTexture: 'Tile-12.png',
    downTransitionTexture: 'Tile-13.png',
    enemyChance: 0.24,
    initialEnemyCount: 10,
    maxEnemyCount: 32,
    initialItemRange: { min: 4, max: 8 },
    enemyGenerator: (pos) => {
      const chosen = randomChoice([
        { weight: 0.5, choice: createBeetle(playerId) },
        { weight: 0.5, choice: createSnail(playerId) },
        { weight: 0.5, choice: createGnat(playerId) },
        { weight: 1, choice: createGhoul(playerId) },
        { weight: 1, choice: createDeformed(playerId) },
        { weight: 1, choice: createGremlin(playerId) },
        { weight: 0.25, choice: createOrc(playerId) },
      ]);
      return createGameEntity(em, chosen, pos);
    },
    itemGenerator: (pos) => {
      const choice = randomChoice(moderateAllItems());
      return createGameEntity(em, choice, pos);
    },
    placers: [
      new CavgeonPlacer((em, depth, { takenMap, openList, fillWallList }) => {
        const oreCount = randomInt(4, 8);
        for (let i = 0; i < oreCount; ++i) {
          const pos = popRandomElement(fillWallList);
          createGameEntity(
            em,
            {
              entity: [
                createBlackOreNDAComponent('lower-mines-fill'),
                new Stone(),
                new Wounds({ current: 1, max: 1, deathDesc: 'deposited on the ground' }),
                new Description({ short: 'rich iron ore' }),
              ],
              items: [createRichIronOre()],
            },
            new GridPos({ ...pos, z: depth })
          );
        }
      }),
      new CavgeonPlacer((em, depth, { takenMap, openList, fillWallList }) => {
        const oreCount = randomInt(3, 7);
        for (let i = 0; i < oreCount; ++i) {
          const pos = popRandomElement(fillWallList);
          createGameEntity(
            em,
            {
              entity: [
                createBrightOreNDAComponent('lower-mines-fill'),
                new Stone(),
                new Wounds({ current: 1, max: 1, deathDesc: 'deposited on the ground' }),
                new Description({ short: 'bright ore' }),
              ],
              items: [createBrightOre()],
            },
            new GridPos({ ...pos, z: depth })
          );
        }
      }),
      new CavgeonPlacer((em, depth, { takenMap, openList, fillWallList }) => {
        const oreCount = randomInt(6, 15);
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
      new CavgeonPlacer((em, depth, { takenMap, openList }) => {
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
          if (skip % 7 === 0) {
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
