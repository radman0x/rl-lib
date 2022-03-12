import { AreaTransitionSpec, GridPos } from '@rad/rl-ecs';
import { popRandomElement, ValueMap, xyPositionsAround } from '@rad/rl-utils';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { AreaIngress } from 'libs/rl-ecs/src/lib/components/area-ingress.model';
import { EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { Room as RadRoom } from './utils';
import { LevelBase, RoomTileType } from './level-base.model';
import { DungeonGenOptions, DungeonPlacer, DungeonTemplate, Pos2d, ROTOpenType } from './utils';
import { CavePlacer, CavgeonGenOptions, CavgeonPlacer, CavgeonTemplate, EntityCreator } from '..';

export class CavgeonLevelTemplate extends LevelBase implements CavgeonTemplate {
  kind: 'CAVGEON' = 'CAVGEON';

  constructor(private options: CavgeonGenOptions & { fillFloor: EntityCreator }) {
    super(options);
  }

  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: CavgeonPlacer[]
  ) {
    const DEPTH = depth * 3;
    const BASEMENT = DEPTH - 1;
    const GROUND = DEPTH;

    const { width, height } = this.options;
    let world = new ROT.Map.Digger(width, height, {});

    const filled = new ValueMap<Pos2d, ROTOpenType>();
    world.create((x: number, y: number, contents: number) => {
      if (contents === 1) {
        filled.set(new Pos2d(x, y), ROTOpenType.BLOCKED);
      } else {
        filled.set(new Pos2d(x, y), ROTOpenType.OPEN);
      }
    });

    const openRoomTiles: Pos2d[] = [];
    const tileTypeMap = new ValueMap<Pos2d, RoomTileType>();
    const allOpenTiles: Pos2d[] = [];
    for (let room of world.getRooms()) {
      room.create((x, y, type) => {
        const open = filled.get(new Pos2d(x, y)) === ROTOpenType.OPEN;
        if (type === RoomTileType.ROOM_WALL && open) {
          return;
        }
        const radType =
          type === RoomTileType.ROOM_WALL ? RoomTileType.ROOM_WALL : RoomTileType.ROOM;
        if (open) {
          openRoomTiles.push(new Pos2d(x, y));
          allOpenTiles.push(new Pos2d(x, y));
        }

        tileTypeMap.set(new Pos2d(x, y), radType);
      });
    }
    const rooms = world
      .getRooms()
      .map((r) => new RadRoom({ x1: r._x1, x2: r._x2, y1: r._y1, y2: r._y2 }));

    for (let corridor of world.getCorridors()) {
      corridor.create((x, y) => {
        if (
          tileTypeMap.get(new Pos2d(x, y)) === undefined &&
          filled.get(new Pos2d(x, y)) === ROTOpenType.OPEN
        ) {
          tileTypeMap.set(new Pos2d(x, y), RoomTileType.CORRIDOR);
          allOpenTiles.push(new Pos2d(x, y));
        }
      });
    }

    for (let [pos, openType] of filled) {
      if (openType === ROTOpenType.BLOCKED && tileTypeMap.get(pos) === undefined) {
        tileTypeMap.set(pos, RoomTileType.FILL);
      }
    }

    const fillWallList: Pos2d[] = [];
    var map = new ROT.Map.Cellular(width, height);
    map.randomize(0.5);
    for (var i = 0; i < 4; i++) map.create();
    map.connect((x, y, contents) => {
      if (contents === 1) {
        // this.options.fill(em, new GridPos({ x, y, z: GROUND }));
        // this.options.fillFloor(em, new GridPos({ x, y, z: BASEMENT }));
        // tileTypeMap.set(new Pos2d(x, y), RoomTileType.FILL);
      } else {
        allOpenTiles.push(new Pos2d(x, y));
        this.options.floor(em, new GridPos({ x, y, z: BASEMENT }));
        tileTypeMap.set(new Pos2d(x, y), RoomTileType.OPEN);
      }
    }, 0);
    for (const [pos, type] of tileTypeMap) {
      if (type === RoomTileType.FILL) {
        const outsideConnected =
          xyPositionsAround({ ...pos, z: 0 }).filter(
            (pos) => tileTypeMap.get(new Pos2d(pos.x, pos.y)) === RoomTileType.OPEN
          ).length !== 0;
        outsideConnected && fillWallList.push(pos);
      }
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
      }
    }

    const takenMap = new ValueMap<Pos2d, EntityId>();
    const {
      downTransitionTexture: downStairTexture,
      upTransitionTexture: upStairTexture,
    } = this.options;
    for (const ingressEgress of transitions.ingressEgress) {
      const egressPos = popRandomElement(openRoomTiles);
      console.log(`Egress placed at: ${egressPos}`);
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
    }

    for (const ingressLabel of transitions.ingressOnly) {
      const ingressPos = popRandomElement(openRoomTiles);
      console.log(`Ingress Only placed at: ${ingressPos}`);
      const ingressId = em.create(
        new GridPos({ ...ingressPos, z: GROUND }),
        new AreaIngress({ label: ingressLabel })
      ).id;
      takenMap.set(new Pos2d(ingressPos.x, ingressPos.y), ingressId);
    }

    for (const placer of [...placers, ...this.options.placers]) {
      placer.place(em, DEPTH, { rooms, takenMap, openList: allOpenTiles, fillWallList });
    }

    this.placeInitialEnemies(allOpenTiles.map((pos2d) => new GridPos({ ...pos2d, z: DEPTH })));

    this.placeInitialItems(allOpenTiles.map((pos2d) => new GridPos({ ...pos2d, z: DEPTH })));
  }
}
