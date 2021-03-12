import { AreaTransitionSpec, EgressDirection } from '@rad/rl-ecs';
import { AreaResolver } from 'libs/rl-ecs/src/lib/utils/area-resolver.util';
import { EntityManager } from 'rad-ecs';
import { DungeonPlacer } from '..';
import { CaveLevelTemplate } from './cave-level.model';
import { DungeonLevelTemplate } from './dungeon-level.model';
import { FinalLevelTemplate } from './final-level.model';
import { CavePlacer } from './utils';

type LevelTemplateUnion =
  | DungeonLevelTemplate
  | CaveLevelTemplate
  | FinalLevelTemplate;
type LevelPlacerUnion = CavePlacer | DungeonPlacer;

export class DungeonBranch {
  private levelPlacers: {
    [levelNumber: string]: LevelPlacerUnion[];
  } = {};
  private levelMergeTransitionSpecs: {
    [levelNumber: string]: AreaTransitionSpec[];
  } = {};

  private levelTemplates: LevelTemplateUnion[];

  constructor(levelTemplates: LevelTemplateUnion[]) {
    this.levelTemplates = [null, ...levelTemplates];
  }

  addBuilders(areaResolver: AreaResolver, entityManager: EntityManager) {
    for (
      let levelNumber = 1;
      levelNumber < this.levelTemplates.length;
      ++levelNumber
    ) {
      areaResolver.setBuilder(this.levelId(levelNumber), () =>
        this.level(entityManager, levelNumber)
      );
    }
  }

  addTransitionsToLevel(levelNumber: number, transitions: AreaTransitionSpec) {
    this.levelMergeTransitionSpecs[levelNumber] =
      this.levelMergeTransitionSpecs[levelNumber] || [];
    this.levelMergeTransitionSpecs[levelNumber].push(transitions);
  }

  addPlacerForLevel(levelNumber: number, placer: DungeonPlacer | CavePlacer) {
    this.levelPlacers[levelNumber] = this.levelPlacers[levelNumber] || [];
    this.levelPlacers[levelNumber].push(placer);
  }

  level(em: EntityManager, levelNumber: number) {
    const transitions: AreaTransitionSpec = {
      ingressOnly: [],
      egressOnly: [],
      ingressEgress: [],
    };
    const connectDownwards = (lvlNum: number) =>
      lvlNum < this.levelTemplates.length - 1;
    const connectUpwards = (lvlNum: number) => lvlNum > 1;

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

    const levelTemplate = this.levelTemplates[levelNumber];
    const placers = this.levelPlacers[levelNumber] ?? [];
    console.log(levelTemplate.kind);
    switch (levelTemplate.kind) {
      case 'CAVE':
        return levelTemplate.generate(
          em,
          mergedTransitions,
          levelNumber,
          placers.filter(
            (placer): placer is CavePlacer => placer.kind === 'CAVE'
          )
        );

      case 'DUNGEON':
        return levelTemplate.generate(
          em,
          mergedTransitions,
          levelNumber,
          placers.filter(
            (placer): placer is DungeonPlacer => placer.kind === 'DUNGEON'
          )
        );
      default:
        throw Error(`Unhandled type in switch!!!`);
    }
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
