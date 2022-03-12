import { AreaTransitionSpec, GridPos } from '@rad/rl-ecs';
import { randomElement, ValueMap, xyPositionsAround } from '@rad/rl-utils';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { AreaIngress } from 'libs/rl-ecs/src/lib/components/area-ingress.model';
import { EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { LevelBase, RoomTileType } from './level-base.model';
import { CaveGenOptions, CavePlacer, CaveTemplate, Pos2d } from './utils';

export class CaveLevelTemplate extends LevelBase implements CaveTemplate {
  kind: 'CAVE' = 'CAVE';

  constructor(private options: CaveGenOptions) {
    super(options);
  }

  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: CavePlacer[]
  ) {
    const DEPTH = depth * 3;
    const BASEMENT = DEPTH - 1;
    const GROUND = DEPTH;

    const { width, height } = this.options;
    const openList: Pos2d[] = [];
    const tileTypeMap = new ValueMap<Pos2d, RoomTileType>();
    const fillWallList: Pos2d[] = [];
    var map = new ROT.Map.Cellular(width, height);
    map.randomize(0.5);
    for (var i = 0; i < 4; i++) map.create();
    map.connect((x, y, contents) => {
      if (contents === 1) {
        this.options.fill(em, new GridPos({ x, y, z: GROUND }));
        this.options.fillFloor(em, new GridPos({ x, y, z: BASEMENT }));
        tileTypeMap.set(new Pos2d(x, y), RoomTileType.FILL);
      } else {
        openList.push(new Pos2d(x, y));
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

    const takenMap = new ValueMap<Pos2d, EntityId>();
    const {
      downTransitionTexture: downStairTexture,
      upTransitionTexture: upStairTexture,
    } = this.options;
    for (const ingressEgress of transitions.ingressEgress) {
      const egressPos = { ...randomElement(openList), z: GROUND };
      console.log(`Egress placed at: ${egressPos}`);
      const stairId = staircasePrefab(
        em,
        { ...randomElement(openList), z: GROUND },
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
      const ingressPos = randomElement(openList);
      console.log(`Ingress Only placed at: ${ingressPos}`);
      const ingressId = em.create(
        new GridPos({ ...ingressPos, z: GROUND }),
        new AreaIngress({ label: ingressLabel })
      ).id;
      takenMap.set(new Pos2d(ingressPos.x, ingressPos.y), ingressId);
    }

    for (const placer of [...placers, ...this.options.placers]) {
      placer.place(em, DEPTH, { takenMap, openList, fillWallList });
    }

    this.placeInitialEnemies(openList.map((pos2d) => new GridPos({ ...pos2d, z: DEPTH })));

    this.placeInitialItems(openList.map((pos2d) => new GridPos({ ...pos2d, z: DEPTH })));
  }
}
