import { Description, Physical, Renderable, Size, Stone, Wounds } from '@rad/rl-ecs';
import { DungeonLevelTemplate } from '@rad/rl-procgen';
import {
  createBlackOreNDAComponent,
  createDarkTileNDAComponent,
  createDimCaveNDAComponent,
  createDimMinesNDAComponent,
} from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
import { EntityId, EntityManager } from 'rad-ecs';

export function createUpperMineTemplate(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new DungeonLevelTemplate({
    wall: (em, ...extras) => {
      em.create(createBlackOreNDAComponent('join'), ...extras);
      return em.create(
        createDimMinesNDAComponent('join'),
        new Physical({ size: Size.FILL }),
        new Wounds({ current: 1, max: 1, deathDesc: 'destroyed' }),
        new Description({ short: 'brick wall' }),
        new Stone(),
        ...extras
      ).id;
    },
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
        createDimCaveNDAComponent('join'),
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
    width,
    height,
    upTransitionTexture: 'Tile-12.png',
    downTransitionTexture: 'Tile-13.png',
    enemyChance: 0.22,
    initialEnemyCount: 8,
    maxEnemyCount: 30,
    initialItemRange: { min: 3, max: 8 },
    enemyGenerator: (pos) => {
      return -1;
      // const chosen = randomEntity([{ weight: 1, generator: () => createOrc(playerId) }]);
      // return createGameEntity(em, chosen, pos);
    },
    itemGenerator: (pos) => 0,
    placers: [],
  });
}
