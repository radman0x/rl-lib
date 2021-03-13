import { AreaTransitionSpec, GridPos } from '@rad/rl-ecs';
import { randomInt, ValueMap } from '@rad/rl-utils';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { AreaIngress } from 'libs/rl-ecs/src/lib/components/area-ingress.model';
import { EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { LevelBase } from './level-base.model';
import {
  DungeonGenOptions,
  DungeonPlacer,
  DungeonTemplate,
  Pos2d,
  randomMiddleRoomPos,
  ROTOpenType,
} from './utils';

enum RoomTileType {
  OPEN = 0,
  WALL = 1,
  DOOR = 2,
  FILL = 3,
  CORRIDOR = 4,
}

export class DungeonLevelTemplate extends LevelBase implements DungeonTemplate {
  kind: 'DUNGEON' = 'DUNGEON';

  constructor(private options: DungeonGenOptions) {
    super(options);
  }

  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: DungeonPlacer[]
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

    const tileTypeMap = new ValueMap<Pos2d, RoomTileType>();
    for (let room of world.getRooms()) {
      room.create((x, y, type) => {
        if (
          type === RoomTileType.WALL &&
          filled.get(new Pos2d(x, y)) === ROTOpenType.OPEN
        ) {
          return;
        }
        tileTypeMap.set(new Pos2d(x, y), type);
      });
    }

    for (let corridor of world.getCorridors()) {
      corridor.create((x, y) => {
        if (
          tileTypeMap.get(new Pos2d(x, y)) === undefined &&
          filled.get(new Pos2d(x, y)) === ROTOpenType.OPEN
        ) {
          tileTypeMap.set(new Pos2d(x, y), RoomTileType.CORRIDOR);
        }
      });
    }

    for (let [pos, openType] of filled) {
      if (
        openType === ROTOpenType.BLOCKED &&
        tileTypeMap.get(pos) === undefined
      ) {
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

    const {
      downTransitionTexture: downStairTexture,
      upTransitionTexture: upStairTexture,
    } = this.options;
    for (const ingressEgress of transitions.ingressEgress) {
      const egressPos = randomMiddleRoomPos(world.getRooms(), DEPTH);
      console.log(`Egress placed at: ${egressPos}`);
      staircasePrefab(
        em,
        randomMiddleRoomPos(world.getRooms(), DEPTH),
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
      const ingressPos = randomMiddleRoomPos(world.getRooms(), DEPTH);
      console.log(`Ingress Only placed at: ${ingressPos}`);
      em.create(
        new GridPos(ingressPos),
        new AreaIngress({ label: ingressLabel })
      );
    }

    const takenMap = new ValueMap<Pos2d, EntityId>();
    for (const placer of [...placers, ...this.options.placers]) {
      placer.place(em, DEPTH, { rooms: world.getRooms(), takenMap });
    }
  }
}
