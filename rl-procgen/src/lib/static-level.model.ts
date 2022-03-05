import { AreaTransitionSpec, GridPos } from '@rad/rl-ecs';
import {
  DungeonGenOptions,
  DungeonPlacer,
  Pos2d,
  ROTOpenType,
  StaticTemplate,
  Room,
} from '@rad/rl-procgen';
import { popRandomElement, ValueMap } from '@rad/rl-utils';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { AreaIngress } from 'libs/rl-ecs/src/lib/components/area-ingress.model';
import { EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { LevelBase } from './level-base.model';

enum RoomTileType {
  OPEN = 0,
  WALL = 1,
  DOOR = 2,
  FILL = 3,
  CORRIDOR = 4,
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
    const openRoomTiles: Pos2d[] = [];
    const tileTypeMap = new ValueMap<Pos2d, RoomTileType>();
    const allOpenTiles: Pos2d[] = [];
    const rooms: Room[] = [];

    const DEPTH = depth * 3;
    const BASEMENT = DEPTH - 1;
    const GROUND = DEPTH;

    const ROOM_MAX = 10;
    for (let x = 1; x <= ROOM_MAX; ++x) {
      for (let y = 1; y <= ROOM_MAX; ++y) {
        tileTypeMap.set(new Pos2d(x, y), RoomTileType.OPEN);
        openRoomTiles.push(new Pos2d(x, y));
        allOpenTiles.push(new Pos2d(x, y));
      }
    }
    rooms.push(new Room(0, ROOM_MAX, 0, ROOM_MAX));

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
      placer.place(em, DEPTH, { rooms, takenMap });
    }

    this.placeInitialEnemies(allOpenTiles.map((pos2d) => new GridPos({ ...pos2d, z: DEPTH })));

    this.placeInitialItems(allOpenTiles.map((pos2d) => new GridPos({ ...pos2d, z: DEPTH })));
  }
}
