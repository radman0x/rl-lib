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
} from '@rad/rl-procgen';
import { randomInt } from '@rad/rl-utils';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { AreaResolver } from 'libs/rl-ecs/src/lib/utils/area-resolver.util';
import { EntityId, EntityManager } from 'rad-ecs';
import { createDwarfStronghold } from './create-dwarf-stronghold';
import { createLowerMineTemplate } from './create-lower-mine-template';
import { createUpperMineTemplate } from './create-upper-mine-template';

export function createKhazElgrad(
  em: EntityManager,
  areaResolver: AreaResolver,
  playerId: EntityId,
  width: number,
  height: number,
  startingLevel: number
): DungeonBranch {
  const upperMines = createUpperMineTemplate(width, height, playerId, em);
  const lowerMines = createLowerMineTemplate(width, height, playerId, em);
  const stronghold = createDwarfStronghold(width, height, playerId, em);
  const dungeonBranch = new DungeonBranch([upperMines, stronghold, lowerMines]);

  dungeonBranch.addPlacerForLevel(
    startingLevel,
    new DungeonPlacer((em, depth, { takenMap, rooms }) => {
      const pos = randomMiddleRoomsPos(rooms, depth);
      em.setComponent(playerId, new GridPos({ ...pos }));
      takenMap.set(new Pos2d(pos.x, pos.y), playerId);
    })
  );

  dungeonBranch.addBuilders(areaResolver, em);

  return dungeonBranch;
}
