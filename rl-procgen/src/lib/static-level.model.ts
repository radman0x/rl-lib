import {
  createGameEntity,
  createLightArmor,
  createSandwich,
  createShortSword,
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
  TargetPositions,
} from '@rad/rl-ecs';
import { DungeonGenOptions, DungeonPlacer, Pos2d, StaticTemplate } from '@rad/rl-procgen';
import { ValueMap } from '@rad/rl-utils';
import {
  createDwarfBarman,
  createDwarfEngineer,
  createDwarfKing,
} from 'libs/rl-applib/src/khaz-elgrad/agent-creators';
import {
  BrownChairType,
  createAlchemyBench,
  createBarSection,
  createBedRoll,
  createBrownChair,
  createDestructibleBoulder,
  createDoubleWallLight,
  createEndGameStairs,
  createFoodDisplay,
  createImpassableBoulder,
  createLessFoodDisplay,
  createRoundTable,
  createSingleWallLight,
  createStrongholdAnvil,
  createWeaponBench,
} from 'libs/rl-applib/src/khaz-elgrad/feature-creators';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { EntityId, EntityManager } from 'rad-ecs';
import { LevelBase, RoomTileType } from './level-base.model';

export class StaticLevelTemplate extends LevelBase implements StaticTemplate {
  kind: 'STATIC' = 'STATIC';
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
############################################l###l#  #l#l###
#################################L#L#######.......  .....##
################################..A..######.<.....  .....##
###########################l####....^###l##......=  .....##
#######################...........................12...>.##
#####.....#############.########.....######......S  .....##
#####...[.#############.########.....######.......  .....##
#####/....#############.###########.#######.......  .....##
#####.....##########l##.###########.########i###i#  #i#i###
######xxxx#######D.......#####l####.######
#######.#########.+.................######
#######.##l###l##-....@..#################
#######...............CT.#################
#################.......c#################
#################........#################
#################........#################
##################.#ii#.##################
#######l###l###l##.#ll#.##l##l##X#########
#####s..........................X#########
#####....######l#.#####.#l######X#########
#####b...#####....#####....###############
##############B...#####...B###############
##############....#####....###############
##########################################
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
      switchPos?: Pos2d;
      bridgePos?: Pos2d[];
      upperMinesPos?: Pos2d;
      lowerMinesPos?: Pos2d;
      barmanPos?: Pos2d;
      barCenterId?: EntityId;
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
        case '<':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          setIngressEgress(pos, transitions.ingressEgress[0]);
          break;
        case '>':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createEndGameStairs(), { ...pos, z: GROUND });
          // setIngressEgress(pos, transitions.ingressEgress[1]);
          break;
        case ' ':
          tileTypeMap.set(pos, RoomTileType.CHASM);
          break;
        case 'S':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          details.switchPos = pos;
          break;
        case '1':
          tileTypeMap.set(pos, RoomTileType.CHASM);
          details.bridgePos = details.bridgePos ?? [];
          details.bridgePos.push(pos);
          em.create(
            new Renderable({ image: 'Tile-32.png', zOrder: 10 }),
            new GridPos({ ...pos, z: BASEMENT })
          );
          break;
        case '2':
          tileTypeMap.set(pos, RoomTileType.CHASM);
          details.bridgePos = details.bridgePos ?? [];
          details.bridgePos.push(pos);
          em.create(
            new Renderable({ image: 'Tile-33.png', zOrder: 10 }),
            new GridPos({ ...pos, z: BASEMENT })
          );
          break;
        case '@':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          playerSpawn.push(pos);
          break;
        case 'X':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createImpassableBoulder(), { ...pos, z: GROUND });
          break;
        case 'x':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createDestructibleBoulder(), { ...pos, z: GROUND });
          break;
        case 'b':
        case 'B':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createBedRoll(c === 'B'), { ...pos, z: GROUND });
          break;
        case '-':
          createGameEntity(em, createBarSection(1), { ...pos, z: GROUND });
          details.barCenterId = createGameEntity(
            em,
            createBarSection(2),
            {
              ...pos,
              x: pos.x + 1,
              z: GROUND,
            },
            new DistanceMap({ map: new ValueMap() }),
            new Alignment({ type: AlignmentType.EVIL })
          );
          createGameEntity(em, createBarSection(3), { ...pos, x: pos.x + 2, z: GROUND });
          break;
        case 'T':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createRoundTable(), { ...pos, z: GROUND });
          break;
        case 'C':
        case 'c':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(
            em,
            createBrownChair(c === 'C' ? BrownChairType.LEFT : BrownChairType.RIGHT),
            { ...pos, z: GROUND }
          );
          break;
        case 'D':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createFoodDisplay(), { ...pos, z: GROUND });
          createGameEntity(em, createLessFoodDisplay(), { ...pos, x: pos.x + 1, z: GROUND });
          break;
        case 'A':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createStrongholdAnvil(em), { ...pos, z: GROUND });
          break;
        case 'L':
          tileTypeMap.set(pos, RoomTileType.ROOM_WALL);
          createGameEntity(em, createDoubleWallLight(), { ...pos, z: GROUND });
          break;
        case 'l':
          tileTypeMap.set(pos, RoomTileType.ROOM_WALL);
          createGameEntity(em, createSingleWallLight(), { ...pos, z: GROUND });
          break;
        case 'i':
          tileTypeMap.set(pos, RoomTileType.ROOM_WALL);
          createGameEntity(em, createSingleWallLight(false), { ...pos, z: GROUND });
          break;
        case '+':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createDwarfBarman(), {
            ...pos,
            z: GROUND,
          });
          break;
        case '^':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createDwarfKing(), {
            ...pos,
            z: GROUND,
          });
          break;
        case '=':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createDwarfEngineer(), {
            ...pos,
            z: GROUND,
          });
          break;
        case 's':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, createSandwich(), {
            ...pos,
            z: GROUND,
          });
          break;
        case '[':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, { entity: createLightArmor() }, new GridPos({ ...pos, z: GROUND }));
          break;
        case '/':
          tileTypeMap.set(pos, RoomTileType.ROOM);
          createGameEntity(em, { entity: createShortSword() }, new GridPos({ ...pos, z: GROUND }));
          break;
      }

      ++posCounter.x;
    }

    const spawnId = em.create(
      new Renderable({ image: 'Tile-25.png', zOrder: 10 }),
      new Physical({ size: Size.FILL })
    ).id;
    createGameEntity(
      em,
      {
        entity: [
          new Renderable({ image: 'Tool-8.png', zOrder: 2 }),
          new Description({
            short: `bridge mechanism`,
          }),
          new Interactable({ failureDesc: 'the bridge mechanism is inoperable!' }),
          new Fixed({}),
        ],
        effects: [
          {
            entity: [
              new SpawnEntity({ entities: [em.createClone(spawnId).id], replaceExisting: true }),
              new TargetPositions({
                positions: [{ ...details.bridgePos[0], z: BASEMENT }],
              }),
              new SingleTarget(),
              new Animation({ name: 'explosionV007effect', speed: 0.25, scale: 0.5 }),
              new Description({
                short: `lowers the bridge`,
              }),
              new LeverageCost({ amount: 5 }),
            ],
          },
          {
            entity: [
              new SpawnEntity({ entities: [em.createClone(spawnId).id], replaceExisting: true }),
              new TargetPositions({
                positions: [{ ...details.bridgePos[1], z: BASEMENT }],
              }),
              new SingleTarget(),
              new Animation({ name: 'explosionV007effect', speed: 0.25, scale: 0.5 }),
              new Description({
                short: `lowers the bridge`,
              }),
              new LeverageCost({ amount: 5 }),
            ],
          },
        ],
      },
      { ...details.switchPos, z: GROUND }
    );

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
      placer.place(em, DEPTH, { rooms: [], takenMap, openList: playerSpawn });
    }
  }
}
