import { AreaTransitionSpec, GridPos, GridPosData } from '@rad/rl-ecs';
import { popRandomElement, ValueMap } from '@rad/rl-utils';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { AreaIngress } from 'libs/rl-ecs/src/lib/components/area-ingress.model';
import { Component, EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';

export type EntityCreator = (em: EntityManager, ...extras: Component[]) => void;

interface Count {
  // per space
  // per room
  // per door
  // number
}

interface Probability {
  // definite
  // percentage
}

interface Placement {
  // wall
  // room
  // passage
  // door
}

// rooms

export interface LevelGenOptions {
  height: number;
  width: number;
  wall: EntityCreator;
  floor: EntityCreator;
  corridor: EntityCreator;
  door: EntityCreator;
  fill: EntityCreator;
  upStairTexture: string;
  downStairTexture: string;
}

enum OpenType {
  OPEN = 0,
  BLOCKED = 1,
}
enum RoomTileType {
  OPEN = 0,
  WALL = 1,
  DOOR = 2,
  FILL = 3,
  CORRIDOR = 4,
}

class Pos2d {
  constructor(public x: number, public y: number) {}

  hash() {
    return `${this.x},${this.y}`;
  }
}

export type Placer = (
  em: EntityManager,
  rooms: any,
  depth: number
) => EntityId[];

export class DungeonLevelTemplate {
  constructor(private options: LevelGenOptions) {}

  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: Placer[]
  ) {
    const DEPTH = depth * 3;
    const BASEMENT = DEPTH - 1;
    const GROUND = DEPTH;

    const { width, height } = this.options;
    let world = new ROT.Map.Uniform(width, height, {
      roomDugPercentage: 0.9,
    });

    const filled = new ValueMap<Pos2d, OpenType>();
    world.create((x: number, y: number, contents: number) => {
      if (contents === 1) {
        filled.set(new Pos2d(x, y), OpenType.BLOCKED);
      } else {
        filled.set(new Pos2d(x, y), OpenType.OPEN);
      }
    });

    const tileTypeMap = new ValueMap<Pos2d, RoomTileType>();
    for (let room of world.getRooms()) {
      room.create((x, y, type) => {
        if (
          type === RoomTileType.WALL &&
          filled.get(new Pos2d(x, y)) === OpenType.OPEN
        ) {
          return;
        }
        if (tileTypeMap.get(new Pos2d(x, y)) !== undefined) {
          console.log(
            `Adding dupe: existing: ${
              RoomTileType[tileTypeMap.get(new Pos2d(x, y))]
            } -> ${RoomTileType[type]}`
          );
        }
        tileTypeMap.set(new Pos2d(x, y), type);
      });
    }

    for (let corridor of world.getCorridors()) {
      corridor.create((x, y) => {
        if (
          tileTypeMap.get(new Pos2d(x, y)) === undefined &&
          filled.get(new Pos2d(x, y)) === OpenType.OPEN
        ) {
          tileTypeMap.set(new Pos2d(x, y), RoomTileType.CORRIDOR);
        }
      });
    }

    for (let [pos, openType] of filled) {
      if (openType === OpenType.BLOCKED && tileTypeMap.get(pos) === undefined) {
        tileTypeMap.set(pos, RoomTileType.FILL);
      }
    }

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
      }
    }

    const randomMiddleRoomPos: () => GridPosData = () => {
      let rooms = [...world.getRooms()];
      console.log(`ROOM COUNT: ${rooms.length}`);
      let stairRoom = popRandomElement(rooms);
      return {
        x: stairRoom.getCenter()[0],
        y: stairRoom.getCenter()[1],
        z: GROUND,
      };
    };

    const { downStairTexture, upStairTexture } = this.options;
    for (const ingressEgress of transitions.ingressEgress) {
      const egressPos = randomMiddleRoomPos();
      console.log(`Egress placed at: ${egressPos}`);
      staircasePrefab(
        em,
        randomMiddleRoomPos(),
        { label: ingressEgress.ingressLabel },
        {
          egressArea: ingressEgress.egressArea,
          egressAreaIngressLabel: ingressEgress.egressAreaIngressLabel,
          egressDirection: ingressEgress.egressDirection,
        },
        downStairTexture,
        upStairTexture
      );
    }

    for (const ingressLabel of transitions.ingressOnly) {
      const ingressPos = randomMiddleRoomPos();
      console.log(`Ingress Only placed at: ${ingressPos}`);
      em.create(
        new GridPos(ingressPos),
        new AreaIngress({ label: ingressLabel })
      );
    }

    for (const placer of placers) {
      const rooms = world.getRooms();
      console.log(`ROOM COUNT: ${rooms.length}`);
      placer(em, rooms, DEPTH);
    }
  }
}
