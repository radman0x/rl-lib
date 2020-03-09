import { ValueMap, xyPositionsAround } from '@rad/rl-utils';
import { alg, Graph } from 'graphlib';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators';
import { AreaResolver } from './area-resolver.model';
import { Blockage } from './components/blockage.model';
import { Climbable } from './components/climbable.model';
import { DistanceMap } from './components/distance-map.model';
import { EndType } from './components/end-state.model';
import { Knowledge } from './components/knowledge.model';
import { Physical, Size } from './components/physical.model';
import { GridPos, GridPosData } from './components/position.model';
import { Sighted } from './components/sighted.model';
import { Logger } from './ecs.types';
import { applyTargetedEffectFlow } from './effects.system';
import { ProtagonistEntity, TargetEntity } from './systems.types';
import {
  hasClimbable,
  radClone,
  notAttackingAI,
  isAttackingAI,
  hasCombatTarget
} from './systems.utils';
import { acquireEffects } from './systems/acquire-effects.system';
import { hookEntitiesAtProtagPos } from './systems/aggregators.system';
import {
  entitiesWithComponents,
  hookEntitiesWithComponents
} from './systems/entities-with-component.system';
import { FOVEntitiesOut, hookFOVEntities } from './systems/fov-entities.system';
import { housekeepingFlow } from './housekeeping.system';
import { MovingAgent } from './components/moving-agent.model';
import { AttackingAgent } from './components/attacking-agent.model';
import { acquireEntityPosition } from './systems/acquire-entity-position.system';
import { acquireAoePositions } from './systems/acquire-aoe-targets.system';
import { acquireCombatTargetAtPosition } from './systems/acquire-combat-target-at-position.system';
import { PlayerAgent } from './components/player-agent.model';
import { Description } from './components/description.model';
import { attackEntityFlow } from './combat.system';
import { bumpMoveFlow, moveRequestFlow } from './movement.system';
import { entitiesWithOneOfComponents } from './systems/entities-with-one-of-components.systems';
import { aiTurnFlow } from './ai-agents.system';

export class SystemOrganiser {
  constructor(
    private em: EntityManager,
    private logger: Logger,
    private areaResolver: AreaResolver,
    private ender: (et: EndType) => void,
    private playerId: EntityId
  ) {}

  public climbRequestFlow() {
    const flowPoints = {
      climbRequest$: new Subject<ProtagonistEntity>(),
      climbCandidate$: new Subject<ProtagonistEntity & TargetEntity>()
    };
    hookEntitiesAtProtagPos(
      flowPoints.climbRequest$,
      flowPoints.climbCandidate$,
      this.em
    );

    const effectFlow = applyTargetedEffectFlow(
      this.em,
      this.areaResolver,
      this.ender
    );

    flowPoints.climbCandidate$
      .pipe(
        mergeMap(msg => of(...acquireEffects(msg, this.em))),
        filter(msg => this.em.hasComponent(msg.effectId, Climbable)),
        map(msg => ({
          ...radClone(msg),
          climbable: this.em.getComponent(msg.effectId, Climbable)
        })),
        filter(msg => hasClimbable(msg)),
        map(msg => ({ ...radClone(msg), targetId: msg.protagId }))
      )
      .subscribe(effectFlow.effectOnEntity$);

    return { ...flowPoints, ...effectFlow };
  }

  public processEndOfTurn() {
    const flowPoints = {
      endOfTurnStart$: new Subject()
    };
    const playerTurnHouseKeeping = housekeepingFlow(this.em);
    const aiTurn = this.processAIAgents();
    flowPoints.endOfTurnStart$.subscribe(
      playerTurnHouseKeeping.housekeepStart$
    );

    playerTurnHouseKeeping.housekeepingFlowFinished$.subscribe(() => {
      console.log(`End of player turn housekeeping complete`);
    });

    playerTurnHouseKeeping.housekeepStart$.subscribe(() =>
      console.log(`End of player turn process started`)
    );

    playerTurnHouseKeeping.housekeepingFlowFinished$
      .pipe(tap(msg => console.log(`AI Turn starts...`)))
      .subscribe(aiTurn.processAIAgentsStart$);

    const aiTurnHousekeeping = housekeepingFlow(this.em);
    aiTurn.aiProcessingFinished$
      .pipe(
        tap(msg => console.log(`AI Turn completed, performing housekeeping`))
      )
      .subscribe(aiTurnHousekeeping.housekeepStart$);

    aiTurnHousekeeping.housekeepingFlowFinished$.subscribe(() => {
      console.log(`AI Turn housekeeping complete`);
    });

    const endOfTurnProcessFinished$ = new Subject();
    const allFlowPoints = {
      ...flowPoints,
      ...playerTurnHouseKeeping,
      ...aiTurn,
      ...aiTurnHousekeeping
    };
    merge(...Object.values(allFlowPoints)).subscribe({
      complete: () => {
        endOfTurnProcessFinished$.next();
        endOfTurnProcessFinished$.complete();
      }
    });

    return { ...allFlowPoints, endOfTurnProcessFinished$ };
  }

  public processAIAgents() {
    const flowPoints = {
      processAIAgentsStart$: new Subject()
    };
    const matches = new Set<EntityId>();
    for (const type of [MovingAgent, AttackingAgent]) {
      this.em
        .matching(type)
        .map(e => e.id)
        .forEach(id => matches.add(id));
    }
    const singleAIFlows: ReturnType<typeof aiTurnFlow>[] = [];
    for (const protagId of Array.from(matches)) {
      const aiFlow = aiTurnFlow(
        this.em,
        this.areaResolver,
        this.ender,
        this.logger
      );
      singleAIFlows.push(aiFlow);
      flowPoints.processAIAgentsStart$
        .pipe(map(msg => ({ protagId })))
        .subscribe(aiFlow.aiTurnStart$);
    }

    const aiProcessingFinished$ = new Subject();
    const allFlowPoints = [].concat(
      ...singleAIFlows.map(flow => Object.values(flow)),
      flowPoints.processAIAgentsStart$
    );

    merge(...allFlowPoints).subscribe({
      complete: () => {
        aiProcessingFinished$.next();
        aiProcessingFinished$.complete();
      }
    });

    return { ...flowPoints, aiProcessingFinished$ };
  }

  errorEncountered(message: string) {
    console.log(`System organiser encountered ERROR: ${message}`);
  }

  hookErrorReporting(obs: Observable<any>) {
    obs.subscribe({ error: msg => this.errorEncountered(msg) });
  }
}
