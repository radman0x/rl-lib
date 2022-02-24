import {
  Climbable,
  Effects,
  EndState,
  EndType,
  GridPos,
  Physical,
  Renderable,
  Size,
} from '@rad/rl-ecs';
import {
  CavePlacer,
  DungeonBranch,
  DungeonPlacer,
  placeEntityInRandomRoom,
  Pos2d,
} from '@rad/rl-procgen';
import { randomInt } from '@rad/rl-utils';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { AreaResolver } from 'libs/rl-ecs/src/lib/utils/area-resolver.util';
import { EntityId, EntityManager } from 'rad-ecs';
import { createCaveTemplate } from './create-cave-level-template';
import { createDungeonTemplate } from './create-dungeon-level-template';
import { createFinalLevelTemplate } from './create-final-level-template';
import {
  createHeavyArmor,
  createLightArmor,
  createLongSword,
  createShortSword,
  createTwoHandedSword,
} from './equippable-prefabs';
import { createSmallFlameWand } from './wand-prefabs';

export function createDungeon(
  em: EntityManager,
  areaResolver: AreaResolver,
  playerId: EntityId,
  width: number,
  height: number,
  startingLevel: number
): DungeonBranch {
  const dungeon = createDungeonTemplate(width, height, playerId, em);
  const cave = createCaveTemplate(width, height, playerId, em);
  const final = createFinalLevelTemplate(width, height, playerId, em);
  const dungeonBranch = new DungeonBranch([final, cave, cave, cave, dungeon, dungeon, dungeon]);

  dungeonBranch.addPlacerForLevel(
    1,
    new CavePlacer((em, depth, { takenMap, openList }) => {
      if (!openList.length) {
        return;
      }
      let chosenPos: Pos2d;
      do {
        const chosen = randomInt(0, openList.length - 1);
        chosenPos = openList[chosen];
      } while (takenMap.has(chosenPos));
      em.create(
        new GridPos({ ...chosenPos, z: depth }),
        new Renderable({ image: 'Door0-41.png', zOrder: 1 }),
        new Physical({ size: Size.MEDIUM }),
        new Fixed({}),
        new Effects({
          contents: [em.create(new Climbable(), new EndState({ endType: EndType.VICTORY })).id],
        })
      ).id;
    })
  );
  dungeonBranch.addPlacerForLevel(
    3,
    new CavePlacer((em, depth, { takenMap, openList }) => {
      if (!openList.length) {
        return;
      }
      let chosenPos: Pos2d;
      do {
        const chosen = randomInt(0, openList.length - 1);
        chosenPos = openList[chosen];
      } while (takenMap.has(chosenPos));

      const sword = em.create(...createTwoHandedSword(new GridPos({ ...chosenPos, z: depth }))).id;
      takenMap.set(chosenPos, sword);

      do {
        const chosen = randomInt(0, openList.length - 1);
        chosenPos = openList[chosen];
      } while (takenMap.has(chosenPos));

      em.create(...createHeavyArmor(new GridPos({ ...chosenPos, z: depth })));
    })
  );

  dungeonBranch.addPlacerForLevel(
    5,
    new DungeonPlacer((em, depth, { rooms, takenMap }) => {
      placeEntityInRandomRoom(
        em.create(...createShortSword()).id,
        em,
        rooms,
        depth,
        (pos) => takenMap.has(new Pos2d(pos.x, pos.y)),
        (pos, id) => takenMap.set(new Pos2d(pos.x, pos.y), id)
      );
      placeEntityInRandomRoom(
        em.create(...createLightArmor()).id,
        em,
        rooms,
        depth,
        (pos) => takenMap.has(new Pos2d(pos.x, pos.y)),
        (pos, id) => takenMap.set(new Pos2d(pos.x, pos.y), id)
      );
    })
  );

  dungeonBranch.addPlacerForLevel(
    startingLevel,
    new CavePlacer((em, depth, { takenMap, openList }) => {
      if (!openList.length) {
        return;
      }
      let chosenPos: Pos2d;
      do {
        const chosen = randomInt(0, openList.length - 1);
        chosenPos = openList[chosen];
      } while (takenMap.has(chosenPos));

      em.setComponent(playerId, new GridPos({ ...chosenPos, z: depth }));
    })
  );

  dungeonBranch.addPlacerForLevel(
    startingLevel,
    new DungeonPlacer((em, depth, { rooms, takenMap }) => {
      const playerPos = placeEntityInRandomRoom(
        playerId,
        em,
        rooms,
        depth,
        (pos) => takenMap.has(new Pos2d(pos.x, pos.y)),
        (pos, id) => takenMap.set(new Pos2d(pos.x, pos.y), id)
      );
      createSmallFlameWand(em, new GridPos({ ...playerPos, x: playerPos.x - 1, z: depth }));
    })
  );

  dungeonBranch.addBuilders(areaResolver, em);

  return dungeonBranch;
}
