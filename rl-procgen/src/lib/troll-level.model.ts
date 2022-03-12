import {
  createGameEntity,
  createLightArmor,
  createMithrilOre,
  createRichIronOre,
  createSandwich,
} from '@rad/rl-applib';
import {
  Alignment,
  AlignmentType,
  Animation,
  AreaTransitionSpec,
  Description,
  DistanceMap,
  GridPos,
  Interactable,
  LeverageCost,
  Physical,
  Renderable,
  Size,
  Stone,
  TargetPositions,
  Wounds,
} from '@rad/rl-ecs';
import {
  DungeonGenOptions,
  DungeonPlacer,
  Pos2d,
  StaticTemplate,
  TrollTemplate,
} from '@rad/rl-procgen';
import { ValueMap } from '@rad/rl-utils';
import {
  createDwarfBarman,
  createDwarfEngineer,
  createDwarfKing,
  createTroll,
} from 'libs/rl-applib/src/khaz-elgrad/agent-creators';
import {
  BrownChairType,
  createBarSection,
  createBedRoll,
  createBrownChair,
  createDestructibleBoulder,
  createDoubleWallLight,
  createFoodDisplay,
  createImpassableBoulder,
  createLessFoodDisplay,
  createRoundTable,
  createSingleWallLight,
  createStrongholdAnvil,
} from 'libs/rl-applib/src/khaz-elgrad/feature-creators';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { createMithrilOreNDAComponent } from 'libs/rl-ecs/src/lib/components/neighbour-display-affected.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { EntityId, EntityManager } from 'rad-ecs';
import { LevelBase, RoomTileType } from './level-base.model';

export class TrollLevelTemplate extends LevelBase implements TrollTemplate {
  kind: 'TROLL' = 'TROLL';
  constructor(private options: DungeonGenOptions) {
    super(options);
  }

  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: DungeonPlacer[]
  ) {
    const textualMap = `
####M#M#M###
#........  #
#.....T..  #
#.  .......i
#.  .@.....#
i..........#
#..........#
#.....  ...i
#  ...  ...#
#  ........#
i........  #
#..>.....  #
############
`;

    const DEPTH = depth * 3;
    const BASEMENT = DEPTH - 1;
    const GROUND = DEPTH;

    const takenMap = new ValueMap<Pos2d, EntityId>();
    const {
      downTransitionTexture: downStairTexture,
      upTransitionTexture: upStairTexture,
    } = this.options;
    const setIngressEgress = (egressPos, ingressEgress) => {
      const stairId = staircasePrefab(
        em,
        new GridPos({ ...egressPos, z: GROUND }),
        { label: ingressEgress.ingressLabel },
        {
          egressArea: ingressEgress.egressArea,
          egressAreaIngressLabel: ingressEgress.egressAreaIngressLabel,
          egressDirection: ingressEgress.egressDirection,
        },
        downStairTexture,
        upStairTexture
      );
      takenMap.set(new Pos2d(egressPos.x, egressPos.y), stairId);
    };

    const prepped = textualMap
      .split('\n')
      .map((s) => [...s].reverse().join(''))
      .join('\n');
    const tileTypeMap = new ValueMap<Pos2d, RoomTileType>();
    const playerSpawn: Pos2d[] = [];
    const posCounter = new Pos2d(0, 0);
    const details: {
      trollPos?: Pos2d;
    } = {};
    for (const c of [...prepped.slice(1, -1)].reverse()) {
      if (c === '\n') {
        ++posCounter.y;
        posCounter.x = 0;
        continue;
      }
      const pos = new Pos2d(posCounter.x, posCounter.y);
      switch (c) {
        case '#':
          tileTypeMap.set(pos, RoomTileType.ROOM_WALL);
          break;
        case '.':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          break;
        case '>':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          setIngressEgress(pos, transitions.ingressEgress[0]);
          break;
        case ' ':
          tileTypeMap.set(pos, RoomTileType.CHASM);
          break;
        case '@':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          playerSpawn.push(pos);
          break;
        case 'i':
          tileTypeMap.set(pos, RoomTileType.ROOM_WALL);
          createGameEntity(em, createSingleWallLight(false), { ...pos, z: GROUND });
          break;
        case 'T':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          details.trollPos = pos;
          break;
        case 'M':
          tileTypeMap.set(pos, RoomTileType.ROOM_WALL);
          createGameEntity(
            em,
            {
              entity: [
                createMithrilOreNDAComponent('troll-fill'),
                new Stone(),
                new Wounds({ current: 1, max: 1, deathDesc: 'deposited on the ground' }),
                new Description({ short: 'mithril ore' }),
              ],
              items: [createMithrilOre()],
            },
            new GridPos({ ...pos, z: GROUND })
          );
          break;
      }

      ++posCounter.x;
    }

    for (let [pos, type] of tileTypeMap) {
      switch (type) {
        case RoomTileType.DOOR:
          this.options.floor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.ROOM:
          this.options.roomFloor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.OPEN:
          this.options.floor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.ROOM_WALL:
          this.options.wall(em, new GridPos({ ...pos, z: GROUND }));
          this.options.wallFloor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.CORRIDOR:
          this.options.corridor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.FILL:
          this.options.fill(em, new GridPos({ ...pos, z: GROUND }));
          this.options.floor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.CHASM:
          this.options.chasm(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
      }
    }

    for (const placer of [...placers, ...this.options.placers]) {
      placer.place(em, DEPTH, {
        rooms: [],
        takenMap,
        openList: [...playerSpawn, details.trollPos],
      });
    }
  }
}
