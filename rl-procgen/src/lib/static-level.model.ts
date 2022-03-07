import {
  Animation,
  Anvil,
  AreaTransitionSpec,
  Climbable,
  ComplexCost,
  Description,
  Effects,
  GridPos,
  Interactable,
  LeverageCost,
  Renderable,
  TargetOrigin,
  TargetPositions,
} from '@rad/rl-ecs';
import {
  DungeonGenOptions,
  DungeonPlacer,
  Pos2d,
  randomNotTakenRoomPos,
  Room,
  StaticTemplate,
} from '@rad/rl-procgen';
import { ValueMap } from '@rad/rl-utils';
import { createEntity } from 'libs/rl-ecs/src/lib/actioners/create-entity.actioner';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { EntityId, EntityManager } from 'rad-ecs';
import { LevelBase } from './level-base.model';

enum RoomTileType {
  OPEN = 0,
  WALL = 1,
  DOOR = 2,
  FILL = 3,
  CORRIDOR = 4,
  CHASM = 5,
}

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
    if (transitions.ingressEgress.length !== 2) {
      throw Error(`Static level expects exactly 2 ingress / egress points`);
    }
    const openRoomTiles: Pos2d[] = [];
    const tileTypeMap = new ValueMap<Pos2d, RoomTileType>();
    const allOpenTiles: Pos2d[] = [];

    const DEPTH = depth * 3;
    const BASEMENT = DEPTH - 1;
    const GROUND = DEPTH;

    const ROOM_MAX_X = 20;
    const ROOM_MAX_Y = 10;
    const CHASM_START = 12;
    const CHASM_END = CHASM_START + 1;
    for (let x = 1; x <= ROOM_MAX_X; ++x) {
      for (let y = 1; y <= ROOM_MAX_Y; ++y) {
        tileTypeMap.set(new Pos2d(x, y), RoomTileType.OPEN);
        openRoomTiles.push(new Pos2d(x, y));
        allOpenTiles.push(new Pos2d(x, y));
      }
    }
    for (let x = CHASM_START; x <= CHASM_END; ++x) {
      for (let y = 1; y <= ROOM_MAX_Y; ++y) {
        tileTypeMap.set(new Pos2d(x, y), RoomTileType.CHASM);
      }
    }

    const accessibleArea = new Room({ x1: 1, x2: CHASM_START - 1, y1: 1, y2: ROOM_MAX_Y });
    const blockedArea = new Room({ x1: CHASM_END + 1, x2: ROOM_MAX_X, y1: 1, y2: ROOM_MAX_Y });

    for (let [pos, type] of tileTypeMap) {
      switch (type) {
        case RoomTileType.DOOR:
          this.options.floor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.OPEN:
          this.options.floor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.WALL:
          this.options.wall(em, new GridPos({ ...pos, z: GROUND }));
          break;
        case RoomTileType.CORRIDOR:
          this.options.corridor(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
        case RoomTileType.FILL:
          this.options.fill(em, new GridPos({ ...pos, z: GROUND }));
          break;
        case RoomTileType.CHASM:
          this.options.chasm(em, new GridPos({ ...pos, z: BASEMENT }));
          break;
      }
    }

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
    // This is a hack, based on the set up of the dungeon branch to have the entrances placed in the right locations :P
    setIngressEgress(accessibleArea.randomPos(), transitions.ingressEgress[0]);
    setIngressEgress(blockedArea.randomPos(), transitions.ingressEgress[1]);

    const spawnId = this.options.floor(em);
    const bridgePos = { x: CHASM_START, y: Math.floor(ROOM_MAX_Y / 2), z: BASEMENT };
    const createBridgeEffect = em.create(
      new SpawnEntity({ entities: [spawnId], replaceExisting: true }),
      new TargetPositions({ positions: [bridgePos, { ...bridgePos, x: bridgePos.x + 1 }] }),
      new SingleTarget(),
      new Description({
        short: `lowers a bridge`,
      }),
      new LeverageCost({ amount: 5 })
    ).id;
    const switchPos = new Pos2d(CHASM_START - 1, Math.floor(ROOM_MAX_Y / 2));
    em.create(
      new GridPos({ ...switchPos, z: GROUND }),
      new Renderable({ image: 'Tool-8.png', zOrder: 2 }),
      new Description({
        short: `mighty crank`,
      }),
      new Effects({ contents: [createBridgeEffect] }),
      new Interactable()
    );

    const fireEffect = em.create(
      new TargetPositions({
        positions: [
          { ...bridgePos, z: GROUND },
          { ...bridgePos, x: bridgePos.x + 1, z: GROUND },
        ],
      }),
      new SingleTarget(),
      new Description({
        short: `makes fire`,
      }),
      new LeverageCost({ amount: 5 }),
      new Animation({ name: 'explosionV007effect', speed: 0.25, scale: 0.5 }),
      new Renderable({
        image: 'Effect0-120.png',
        uiImage: 'assets/interface/Effect0-120.png',
        zOrder: 1,
      })
    ).id;
    const secondSwitchPos = new Pos2d(CHASM_START - 3, Math.floor(ROOM_MAX_Y / 2));
    em.create(
      new GridPos({ ...secondSwitchPos, z: GROUND }),
      new Renderable({ image: 'Chest0-4.png', zOrder: 2 }),
      new Anvil(),
      new Description({
        short: `Anvil`,
      }),
      new Effects({ contents: [fireEffect] })
    );

    for (const placer of [...placers, ...this.options.placers]) {
      placer.place(em, DEPTH, { rooms: [accessibleArea], takenMap });
    }

    this.placeInitialEnemies(allOpenTiles.map((pos2d) => new GridPos({ ...pos2d, z: GROUND })));

    this.placeInitialItems(allOpenTiles.map((pos2d) => new GridPos({ ...pos2d, z: GROUND })));
  }
}
