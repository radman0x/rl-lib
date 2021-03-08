import {
  AreaGenerator,
  AreaTransitionSpec,
  EgressDirection,
  GridPos,
  GridPosData,
  Physical,
  Renderable,
  Size,
} from '@rad/rl-ecs';
import { popRandomElement } from '@rad/rl-utils';
import { AreaResolver } from 'libs/rl-ecs/src/lib/utils/area-resolver.util';
import { staircasePrefab } from 'libs/rl-ecs/src/lib/component-utils.model';
import { AreaIngress } from 'libs/rl-ecs/src/lib/components/area-ingress.model';
import { Component, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';

const BLOCKED = 1;
const OPEN = 0;

export type EntityCreator = (em: EntityManager, ...extras: Component[]) => void;
export class DungeonBranch {
  private levelEntities: {
    [levelNumber: string]: EntityCreator[];
  } = {};
  private levelMergeTransitionSpecs: {
    [levelNumber: string]: AreaTransitionSpec[];
  } = {};

  constructor(
    private options: {
      levelWidth: number;
      levelHeight: number;
      maxDepth: number;
      minDepth: number;
      floorTexture: string;
      wallTexture: string;
      upStairTexture: string;
      downStairTexture: string;
    }
  ) {}

  addBuilders(resolver: AreaResolver, entityManager: EntityManager) {
    for (
      let depth = this.options.minDepth;
      depth <= this.options.maxDepth;
      ++depth
    ) {
      resolver.setBuilder(this.levelId(depth), () =>
        this.level(entityManager, depth)
      );
    }
  }

  addTransitionsToLevel(levelNumber: number, transitions: AreaTransitionSpec) {
    this.levelMergeTransitionSpecs[levelNumber] =
      this.levelMergeTransitionSpecs[levelNumber] || [];
    this.levelMergeTransitionSpecs[levelNumber].push(transitions);
  }

  randomlyPlaceEntityInLevel(
    levelNumber: number,
    entityCreator: EntityCreator
  ) {
    this.levelEntities[levelNumber] = this.levelEntities[levelNumber] || [];
    this.levelEntities[levelNumber].push(entityCreator);
  }

  level(entityManager: EntityManager, levelNumber: number) {
    const transitions: AreaTransitionSpec = {
      ingressOnly: [],
      egressOnly: [],
      ingressEgress: [],
    };
    const connectDownwards = (depth: number) => depth < this.options.maxDepth;
    const connectUpwards = (depth: number) => depth > this.options.minDepth;

    if (connectDownwards(levelNumber)) {
      console.log(`Adding downwards egress`);
      transitions.ingressEgress.push({
        egressArea: this.levelId(levelNumber + 1),
        egressAreaIngressLabel: this.ingressId(levelNumber + 1, 1),
        ingressLabel: this.ingressId(levelNumber, 2),
        egressDirection: EgressDirection.DOWN,
      });
    }
    if (connectUpwards(levelNumber)) {
      console.log(`Adding upwards egress`);
      transitions.ingressEgress.push({
        egressArea: this.levelId(levelNumber - 1),
        egressAreaIngressLabel: this.ingressId(levelNumber - 1, 2),
        ingressLabel: this.ingressId(levelNumber, 1),
        egressDirection: EgressDirection.UP,
      });
    }

    return this.dungeonLevel(entityManager, transitions, levelNumber);
  }

  private dungeonLevel(
    entityManager: EntityManager,
    transitions: AreaTransitionSpec,
    levelNumber: number
  ) {
    const DEPTH = levelNumber * 3;
    const BASEMENT = DEPTH - 1;
    const GROUND = DEPTH;
    const generateLevel: AreaGenerator = (
      em: EntityManager,
      transitionSpec: AreaTransitionSpec
    ) => {
      let world = new ROT.Map.Uniform(
        this.options.levelWidth,
        this.options.levelHeight,
        {
          roomDugPercentage: 0.9,
        }
      );
      world.create((x: number, y: number, contents: number) => {
        if (contents === BLOCKED) {
          em.create(
            new Renderable({ image: this.options.wallTexture, zOrder: 1 }),
            new GridPos({ x, y, z: GROUND }),
            new Physical({ size: Size.FILL })
          );
        } else if (contents === OPEN) {
          em.create(
            new Renderable({ image: this.options.floorTexture, zOrder: 1 }),
            new GridPos({ x, y, z: BASEMENT }),
            new Physical({ size: Size.FILL })
          );
        }
      });

      const randomPlacePos: () => GridPosData = () => {
        let rooms = world.getRooms();
        let stairRoom = popRandomElement(rooms);
        return {
          x: stairRoom.getCenter()[0],
          y: stairRoom.getCenter()[1],
          z: GROUND,
        };
      };

      let mergedTransitions: AreaTransitionSpec;
      const addTransitions = this.levelMergeTransitionSpecs[levelNumber];
      if (addTransitions) {
        mergedTransitions = addTransitions.reduce(
          (accum, curr) => this.mergeTransitionsSpecs(accum, curr),
          transitionSpec
        );
      } else {
        mergedTransitions = transitionSpec;
      }

      for (const ingressEgress of mergedTransitions.ingressEgress) {
        const egressPos = randomPlacePos();
        console.log(`Egress placed at: ${egressPos}`);
        staircasePrefab(
          em,
          randomPlacePos(),
          { label: ingressEgress.ingressLabel },
          {
            egressArea: ingressEgress.egressArea,
            egressAreaIngressLabel: ingressEgress.egressAreaIngressLabel,
            egressDirection: ingressEgress.egressDirection,
          },
          this.options.downStairTexture,
          this.options.upStairTexture
        );
      }

      for (const ingressLabel of mergedTransitions.ingressOnly) {
        const ingressPos = randomPlacePos();
        console.log(`Ingress Only placed at: ${ingressPos}`);
        em.create(
          new GridPos(ingressPos),
          new AreaIngress({ label: ingressLabel })
        );
      }

      const levelEntities = this.levelEntities[levelNumber];
      if (levelEntities) {
        for (const creator of levelEntities) {
          const entityPos = randomPlacePos();
          console.log(`Placing preconfigured entity at: ${entityPos}`);
          creator(em, new GridPos(entityPos));
        }
      }
    };

    generateLevel(entityManager, transitions);
  }

  private mergeTransitionsSpecs(
    lhs: AreaTransitionSpec,
    rhs: AreaTransitionSpec
  ): AreaTransitionSpec {
    return {
      ingressOnly: lhs.ingressOnly.concat(rhs.ingressOnly),
      egressOnly: lhs.egressOnly.concat(rhs.egressOnly),
      ingressEgress: lhs.ingressEgress.concat(rhs.ingressEgress),
    };
  }

  public levelId(levelNumber: number): string {
    return `DngLvl-${levelNumber}`;
  }

  public ingressId(levelNumber: number, entrance: number): string {
    return `${this.levelId(levelNumber)}-ingress-${entrance}`;
  }
}
