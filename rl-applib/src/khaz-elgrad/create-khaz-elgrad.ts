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
  randomMiddleRoomsPos,
  randomNotTakenRoomsPos,
} from '@rad/rl-procgen';
import { popRandomElement, randomElement, randomInt } from '@rad/rl-utils';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { AreaResolver } from 'libs/rl-ecs/src/lib/utils/area-resolver.util';
import { EntityId, EntityManager } from 'rad-ecs';
import { createCavgeonTemplate, createGameEntity, createIronOre } from '..';
import { createBeetle, createOrc } from './agent-creators';
import { createDwarfStronghold } from './create-dwarf-stronghold';
import { createLowerMineTemplate } from './create-lower-mine-template';
import { createUpperMineTemplate } from './create-upper-mine-template';
import { createEndGameStairs } from './feature-creators';

export function createKhazElgrad(
  em: EntityManager,
  areaResolver: AreaResolver,
  playerId: EntityId,
  width: number,
  height: number,
  startingLevel: number
): DungeonBranch {
  const cavgeon = createCavgeonTemplate(width, height, playerId, em);
  const upperMines = createUpperMineTemplate(width, height, playerId, em);
  const lowerMines = createLowerMineTemplate(width, height, playerId, em);
  const stronghold = createDwarfStronghold(width, height, playerId, em);
  const dungeonBranch = new DungeonBranch([upperMines, stronghold, lowerMines, cavgeon]);

  dungeonBranch.addPlacerForLevel(
    startingLevel,
    new DungeonPlacer((em, depth, { takenMap, rooms }) => {
      const pos = randomNotTakenRoomsPos(rooms, depth, (pos) =>
        takenMap.has(new Pos2d(pos.x, pos.y))
      );
      em.setComponent(playerId, new GridPos({ ...pos }));
      // createGameEntity(em, createBeetle(playerId), { ...pos, x: pos.x + 1 });
      // createGameEntity(em, createOrc(playerId), { ...pos, x: pos.x - 1 });
      takenMap.set(new Pos2d(pos.x, pos.y), playerId);
    })
  );

  dungeonBranch.addPlacerForLevel(
    3,
    new CavePlacer((em, depth, { takenMap, openList }) => {
      for (let i = 0; i < 20; ++i) {
        const pos = popRandomElement(openList);
        createGameEntity(em, createIronOre(), { ...pos, z: depth });
        takenMap.set(new Pos2d(pos.x, pos.y), playerId);
      }
    })
  );

  dungeonBranch.addPlacerForLevel(
    1,
    new DungeonPlacer((em, depth, { takenMap, rooms }) => {
      const pos = randomNotTakenRoomsPos(rooms, depth, (pos) =>
        takenMap.has(new Pos2d(pos.x, pos.y))
      );
      createGameEntity(em, createEndGameStairs(), pos);
    })
  );

  dungeonBranch.addBuilders(areaResolver, em);

  return dungeonBranch;
}
