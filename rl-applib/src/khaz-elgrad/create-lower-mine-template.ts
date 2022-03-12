import {
  Description,
  GridPos,
  Inventory,
  Physical,
  Renderable,
  Size,
  Stone,
  Wounds,
} from '@rad/rl-ecs';
import { CaveLevelTemplate, CavePlacer } from '@rad/rl-procgen';
import { popRandomElement } from '@rad/rl-utils';
import {
  createBlackOreNDAComponent,
  createBlackVolcanicNDAComponent,
  createDimCaveNDAComponent,
} from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
import { EntityId, EntityManager } from 'rad-ecs';
import { createGameEntity, createIronOre, randomEntity } from '..';
import { createBeetle } from './agent-creators';

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
    downTransitionTexture: 'Decor0-12.png',
    upTransitionTexture: 'Decor0-12.png',
    enemyChance: 0.27,
    initialEnemyCount: 10,
    maxEnemyCount: 40,
    initialItemRange: { min: 6, max: 11 },
    enemyGenerator: (pos) => {
      const chosen = randomEntity([{ weight: 1, generator: () => createBeetle(playerId) }]);
      return createGameEntity(em, chosen, pos);
    },
    itemGenerator: (pos) => 0,
    placers: [
      new CavePlacer((em, depth, { takenMap, openList, fillWallList }) => {
        for (let i = 0; i < 50; ++i) {
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
    ],
  });
}
