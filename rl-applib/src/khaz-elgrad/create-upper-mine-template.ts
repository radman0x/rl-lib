import { Physical, Renderable, Size } from '@rad/rl-ecs';
import { DungeonLevelTemplate } from '@rad/rl-procgen';
import { NeighbourDisplayAffected } from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
import { EntityId, EntityManager } from 'rad-ecs';
import { randomEntity, createGameEntity } from '..';
import { createBeetle, createOrc } from './agent-creators';

export function createUpperMineTemplate(
  width: number,
  height: number,
  playerId: EntityId,
  em: EntityManager
) {
  return new DungeonLevelTemplate({
    wall: (em, ...extras) =>
      em.create(
        new NeighbourDisplayAffected({
          typeId: 'dungeon-dark',
          adjacencyImageMap: {
            NONE: { image: 'Silver-Wall-NONE.png' },
            N: { image: 'Silver-Wall-N.png' },
            E: { image: 'Silver-Wall-W_E.png' },
            S: { image: 'Silver-Wall-S_N.png' },
            W: { image: 'Silver-Wall-W_E.png' },
            N_E: { image: 'Silver-Wall-N_E.png' },
            S_N_E: { image: 'Silver-Wall-S_N_E.png' },
            S_E: { image: 'Silver-Wall-S_E.png' },
            S_N: { image: 'Silver-Wall-S_N.png' },
            W_E: { image: 'Silver-Wall-W_E.png' },
            W_N: { image: 'Silver-Wall-W_N.png' },
            W_N_E: { image: 'Silver-Wall-W_N_E.png' },
            W_S: { image: 'Silver-Wall-W_S.png' },
            W_S_E: { image: 'Silver-Wall-W_S_E.png' },
            W_S_N: { image: 'Silver-Wall-W_S_N.png' },
            W_S_N_E: { image: 'Silver-Wall-W_S_N_E.png' },
          },
        }),
        // new Renderable({ image: 'Floor-295.png', zOrder: 1 }),
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
    enemyGenerator: (pos) => {
      return -1;
      // const chosen = randomEntity([{ weight: 1, generator: () => createOrc(playerId) }]);
      // return createGameEntity(em, chosen, pos);
    },
    itemGenerator: (pos) => 0,
    placers: [],
  });
}
