import {
  AreaTransitionSpec,
  EgressDirection,
  GridPos,
  LightSource,
  Renderable,
} from '@rad/rl-ecs';
import { AreaResolver } from 'libs/rl-ecs/src/lib/utils/area-resolver.util';
import { EntityManager } from 'rad-ecs';
import { DungeonLevelTemplate, Placer } from './dungeon-level.model';

export class DungeonBranch {
  private levelPlacers: {
    [levelNumber: string]: Placer[];
  } = {};
  private levelMergeTransitionSpecs: {
    [levelNumber: string]: AreaTransitionSpec[];
  } = {};

  constructor(
    private levelTemplate: DungeonLevelTemplate,
    private options: {
      maxDepth: number;
      minDepth: number;
    }
  ) {}

  addBuilders(areaResolver: AreaResolver, entityManager: EntityManager) {
    for (
      let depth = this.options.minDepth;
      depth <= this.options.maxDepth;
      ++depth
    ) {
      areaResolver.setBuilder(this.levelId(depth), () =>
        this.level(entityManager, depth)
      );
    }
  }

  addTransitionsToLevel(levelNumber: number, transitions: AreaTransitionSpec) {
    this.levelMergeTransitionSpecs[levelNumber] =
      this.levelMergeTransitionSpecs[levelNumber] || [];
    this.levelMergeTransitionSpecs[levelNumber].push(transitions);
  }

  addPlacerForLevel(levelNumber: number, placer: Placer) {
    this.levelPlacers[levelNumber] = this.levelPlacers[levelNumber] || [];
    this.levelPlacers[levelNumber].push(placer);
  }

  level(em: EntityManager, levelNumber: number) {
    const transitions: AreaTransitionSpec = {
      ingressOnly: [],
      egressOnly: [],
      ingressEgress: [],
    };
    const connectDownwards = (depth: number) => depth < this.options.maxDepth;
    const connectUpwards = (depth: number) => depth > this.options.minDepth;

    if (connectDownwards(levelNumber)) {
      transitions.ingressEgress.push({
        egressArea: this.levelId(levelNumber + 1),
        egressAreaIngressLabel: this.ingressId(levelNumber + 1, 1),
        ingressLabel: this.ingressId(levelNumber, 2),
        egressDirection: EgressDirection.DOWN,
      });
    }
    if (connectUpwards(levelNumber)) {
      transitions.ingressEgress.push({
        egressArea: this.levelId(levelNumber - 1),
        egressAreaIngressLabel: this.ingressId(levelNumber - 1, 2),
        ingressLabel: this.ingressId(levelNumber, 1),
        egressDirection: EgressDirection.UP,
      });
    }

    let mergedTransitions: AreaTransitionSpec;
    const addTransitions = this.levelMergeTransitionSpecs[levelNumber];
    if (addTransitions) {
      mergedTransitions = addTransitions.reduce(
        (accum, curr) => this.mergeTransitionSpecs(accum, curr),
        transitions
      );
    } else {
      mergedTransitions = transitions;
    }

    return this.levelTemplate.generate(em, mergedTransitions, levelNumber, [
      ...(this.levelPlacers[levelNumber] ?? []),
      (em, depth, { rooms, takenMap }) => {
        for (let room of rooms) {
          const [x, y] = room.getCenter();

          em.create(
            new GridPos({ x, y, z: depth }),
            new LightSource({ strength: [200, 200, 200] }),
            new Renderable({ image: 'Decor0-65.png', zOrder: 0 })
          ).id;
        }
      },
    ]);
  }

  private mergeTransitionSpecs(
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
