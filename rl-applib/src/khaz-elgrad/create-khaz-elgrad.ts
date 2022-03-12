import { GridPos } from '@rad/rl-ecs';
import { CavePlacer, DungeonBranch, DungeonPlacer, Pos2d } from '@rad/rl-procgen';
import { randomElement } from '@rad/rl-utils';
import { AreaResolver } from 'libs/rl-ecs/src/lib/utils/area-resolver.util';
import { EntityId, EntityManager } from 'rad-ecs';
import { createCavgeonTemplate, createGameEntity, createPickAxe, createTrollDen } from '..';
import { createDwarfStronghold } from './create-dwarf-stronghold';
import { createLowerMineTemplate } from './create-lower-mine-template';

export function createKhazElgrad(
  em: EntityManager,
  areaResolver: AreaResolver,
  playerId: EntityId,
  width: number,
  height: number,
  startingLevel: number
): DungeonBranch {
  const cavgeon = createCavgeonTemplate(width, height, playerId, em);
  const lowerMines = createLowerMineTemplate(width, height, playerId, em);
  const trollDen = createTrollDen(width, height, playerId, em);
  const stronghold = createDwarfStronghold(width, height, playerId, em);
  const dungeonBranch = new DungeonBranch([
    stronghold,
    lowerMines,
    lowerMines,
    cavgeon,
    cavgeon,
    cavgeon,
    trollDen,
  ]);

  dungeonBranch.addPlacerForLevel(
    startingLevel,
    new DungeonPlacer((em, depth, { takenMap, rooms, openList }) => {
      const pos = openList[0];
      em.setComponent(playerId, new GridPos({ ...pos, z: depth }));
      takenMap.set(new Pos2d(pos.x, pos.y), playerId);
    })
  );

  // guaranteed pick-axe on first mines level
  dungeonBranch.addPlacerForLevel(
    2,
    new CavePlacer((em, depth, { openList }) => {
      const pos = randomElement(openList);
      createGameEntity(em, createPickAxe(), new GridPos({ ...pos, z: depth }));
    })
  );

  dungeonBranch.addBuilders(areaResolver, em);

  return dungeonBranch;
}
