import { ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators';
import { GridPosData } from '..';
import { AreaResolver } from './area-resolver.model';
import { AttackingAgent } from './components/attacking-agent.model';
import { Blockage } from './components/blockage.model';
import { Climbable } from './components/climbable.model';
import { Description } from './components/description.model';
import { EndType } from './components/end-state.model';
import { Knowledge } from './components/knowledge.model';
import { PlayerAgent } from './components/player-agent.model';
import { Sighted } from './components/sighted.model';
import { Logger } from './ecs.types';
import {
  ActiveEffect,
  Collected,
  CombatTarget,
  Damaged,
  DamageType,
  EffectStart,
  EnteredPos,
  ProtagonistEntity,
  StrikeResult,
  TargetEntity,
  TargetPos,
  Teleported,
  WoundResult,
  WoundsInflicted,
  ReapedEntity,
  CombatResult
} from './systems.types';
import {
  hasAreaTransition,
  hasClimbable,
  hasCombatTarget,
  hasDamage,
  hasLockChange,
  hasOutcomeDescription,
  hasSpatialChange,
  noCombatTarget,
  radClone,
  strikeFailure,
  strikeSuccess,
  woundFailure,
  hasReaped
} from './systems.utils';
import {
  acquireAoePositions,
  hookAoeTarget
} from './systems/acquire-aoe-targets.system';
import { acquireCombatTargetAtPosition } from './systems/acquire-combat-target-at-position.system';
import { acquireEffects } from './systems/acquire-effects.system';
import { acquireEntityPosition } from './systems/acquire-entity-position.system';
import { hookAddToInventory } from './systems/add-to-inventory.system';
import {
  hookEntitiesAtProtagPos,
  hookPerformMove
} from './systems/aggregators.system';
import { area } from './systems/area.system';
import { burn } from './systems/burn.system';
import { CanOccupyPositionArgs } from './systems/can-occupy-position.system';
import { CanStandAtArgs } from './systems/can-stand-at-position.system';
import { endState } from './systems/end-state.system';
import { hookEntitiesAtPosition } from './systems/entities-at-position.system';
import { hookEntitiesWithComponent } from './systems/entities-with-component.system';
import { fireResist } from './systems/fire-resist.system';
import { FOVEntitiesOut, hookFOVEntities } from './systems/fov-entities.system';
import { freeze } from './systems/freeze.system';
import { grimReaper } from './systems/grim-reaper.system';
import { integrity } from './systems/integrity.system';
import { lockQuality } from './systems/lock-quality.system';
import { lock } from './systems/lock.system';
import {
  positionNextToEntity,
  PositionNextToEntityArgs
} from './systems/position-next-to-entity.system';
import { resolveMeleeAttackDamage } from './systems/resolve-melee-attack-damage.system';
import { resolveStrike } from './systems/resolve-strike.system';
import { resolveWound } from './systems/resolve-wound.system';
import { hookSingleTarget } from './systems/single-target.system';
import { spatial } from './systems/spatial.system';
import { teleport } from './systems/teleport.system';
import { toggleLock } from './systems/toggle-lock.system';
import {
  transitionArea,
  TransitionAreaOut
} from './systems/transition-area.system';

export class SystemOrganiser {
  constructor(
    private em: EntityManager,
    private logger: Logger,
    private areaResolver: AreaResolver,
    private ender: (et: EndType) => void,
    private playerId: EntityId
  ) {}

  public collectItemFlow(protagId: EntityId) {
    const collectItem = new Subject<ProtagonistEntity>();
    const performCollection = new Subject<ProtagonistEntity & TargetEntity>();
    const itemCollected = new Subject<
      ProtagonistEntity & TargetEntity & Collected
    >();
    hookEntitiesAtProtagPos(collectItem, performCollection, this.em);
    hookAddToInventory(performCollection, itemCollected, this.em, this.logger);
    const collections = itemCollected.pipe(
      reduce(
        (acc, curr) => {
          acc.push(curr);
          return acc;
        },
        [] as (ProtagonistEntity & TargetEntity & Collected)[]
      )
    );
    const outputObs = new ReplaySubject<
      (ProtagonistEntity & TargetEntity & Collected)[]
    >();
    collections.subscribe(outputObs);
    collectItem.next({ protagId });
    collectItem.complete();
    return outputObs;
  }

  public moveOrderFlow() {
    const flowPoints = {
      moveRequest$: new Subject<PositionNextToEntityArgs>(),
      combatTargetAssessed$: new Subject<
        Partial<CombatTarget> & TargetPos & ProtagonistEntity
      >(),
      moveOrdered$: new Subject<CanOccupyPositionArgs & CanStandAtArgs>(),
      positionEntered$: new ReplaySubject<ProtagonistEntity & EnteredPos>(),
      entitiesAtNewPos$: new Subject<ProtagonistEntity & TargetEntity>(),
      noteworthyAtNewPos$: new Subject<(ProtagonistEntity & TargetEntity)[]>()
    };

    flowPoints.moveRequest$
      .pipe(
        tap(msg => console.log(`Beginning assess pipe &&&`)),
        map(msg => positionNextToEntity(msg, this.em)),
        map(msg => acquireCombatTargetAtPosition(msg, this.em)),
        tap(msg => console.log(`Emitting assessed &&& `))
      )
      .subscribe(flowPoints.combatTargetAssessed$);

    flowPoints.combatTargetAssessed$
      .pipe(
        tap(msg =>
          console.log(`Checking move: ${JSON.stringify(msg, null, 2)}`)
        ),
        filter(noCombatTarget),
        tap(msg => console.log(`Moving!!`))
      )
      .subscribe(flowPoints.moveOrdered$);

    const combatFlowPoints = this.attackEntityFlow();
    flowPoints.combatTargetAssessed$
      .pipe(
        tap(msg =>
          console.log(`Checking attack: ${JSON.stringify(msg, null, 2)}`)
        ),
        filter(hasCombatTarget),
        tap(msg => console.log(`Attacking!!`))
      )
      .subscribe(combatFlowPoints.meleeAttack$);

    hookPerformMove(
      flowPoints.moveOrdered$,
      flowPoints.positionEntered$,
      this.em
    );

    hookEntitiesAtProtagPos(
      flowPoints.positionEntered$,
      flowPoints.entitiesAtNewPos$,
      this.em
    );
    flowPoints.entitiesAtNewPos$
      .pipe(
        filter(msg => this.em.hasComponent(msg.targetId, Description)),
        reduce(
          (acc, curr) => {
            acc.push(curr);
            return acc;
          },
          [] as (ProtagonistEntity & TargetEntity)[]
        )
      )
      .subscribe(flowPoints.noteworthyAtNewPos$);

    return { ...flowPoints, ...combatFlowPoints };
  }

  public attackEntityFlow() {
    const flowPoints = {
      meleeAttack$: new Subject<CombatTarget & ProtagonistEntity>(),
      strikeResolved$: new Subject<
        CombatTarget & ProtagonistEntity & StrikeResult
      >(),
      woundResolved$: new Subject<
        CombatTarget & ProtagonistEntity & WoundResult & StrikeResult
      >(),
      combatResolved$: new Subject<
        CombatTarget &
          ProtagonistEntity &
          WoundsInflicted &
          WoundResult &
          StrikeResult
      >(),
      inflictDamage$: new Subject<
        TargetEntity & ProtagonistEntity & Damaged & WoundResult & StrikeResult
      >(),
      combatResult$: new ReplaySubject<CombatResult>()
    };
    flowPoints.meleeAttack$
      .pipe(map(msg => resolveStrike(msg, this.em)))
      .subscribe(flowPoints.strikeResolved$);

    // strike failed
    flowPoints.strikeResolved$
      .pipe(filter(strikeFailure))
      .subscribe(flowPoints.combatResult$);

    // strike succeeded
    flowPoints.strikeResolved$
      .pipe(
        filter(strikeSuccess),
        map(msg => resolveWound(msg, this.em))
      )
      .subscribe(flowPoints.woundResolved$);

    // wound failed
    flowPoints.woundResolved$
      .pipe(filter(woundFailure))
      .subscribe(flowPoints.combatResult$);

    // wound succeeded
    const modActionFlow = this.modifyActionFlow();
    flowPoints.woundResolved$
      .pipe(
        filter(msg => msg.woundSuccess),
        map(msg => resolveMeleeAttackDamage(msg, this.em))
      )
      .subscribe(flowPoints.combatResolved$);

    flowPoints.combatResolved$.subscribe(flowPoints.combatResult$);

    flowPoints.combatResolved$
      .pipe(
        map(msg => ({
          ...msg,
          damage: { type: DamageType.PHYSICAL, amount: msg.woundsInflicted },
          targetId: msg.combatTargetId
        }))
      )
      .subscribe(modActionFlow.actionInput$);

    const procActionFlow = this.processActionFlow();
    modActionFlow.actionModified$.subscribe(procActionFlow.processAction$);

    return { ...flowPoints, ...modActionFlow, ...procActionFlow };
  }

  public runTargetedEffectFlow(effectStart: EffectStart) {
    this.applyTargetedEffectFlow().applyTargetedEffect$.next(effectStart);
  }

  public applyTargetedEffectFlow() {
    const flowPoints = {
      applyTargetedEffect$: new Subject<EffectStart>(),
      effectAtPosition$: new Subject<TargetPos & ActiveEffect>(),
      effectOnEntity$: new Subject<TargetEntity & ActiveEffect>(),
      outcomeDescriptions$: new ReplaySubject<
        {
          worldStateChangeDescription: string;
          activeEffectDescription: string;
        }[]
      >()
    };
    hookSingleTarget(
      flowPoints.applyTargetedEffect$,
      flowPoints.effectAtPosition$,
      this.em
    );
    hookAoeTarget(
      flowPoints.applyTargetedEffect$,
      flowPoints.effectAtPosition$,
      this.em
    );
    hookEntitiesAtPosition(
      flowPoints.effectAtPosition$,
      flowPoints.effectOnEntity$,
      this.em
    );

    const modifyFlow = this.modifyActionFlow();
    merge(
      flowPoints.effectOnEntity$.pipe(
        map(msg => endState(msg, this.em, this.ender))
      ),
      flowPoints.effectOnEntity$.pipe(map(msg => burn(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => freeze(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => toggleLock(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => teleport(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => transitionArea(msg, this.em)))
    ).subscribe(modifyFlow.actionInput$);

    const actionFlow = this.processActionFlow();
    modifyFlow.actionModified$.subscribe(actionFlow.processAction$);

    merge(actionFlow.lockStateChanged$, actionFlow.areaTransitioned$)
      .pipe(
        filter(hasOutcomeDescription),
        reduce(
          (acc, curr) => {
            acc.push(curr);
            return acc;
          },
          [] as {
            activeEffectDescription: string;
            worldStateChangeDescription: string;
          }[]
        )
      )
      .subscribe(flowPoints.outcomeDescriptions$);

    return flowPoints;
  }

  public processActionFlow() {
    const flowPoints = {
      processAction$: new Subject<
        TargetEntity & ActiveEffect & Damaged & Teleported
      >(),
      integrityModified$: new Subject<TargetEntity>(),
      lockStateChanged$: new Subject<any>(),
      areaTransitioned$: new Subject<
        Damaged &
          TargetEntity &
          ActiveEffect &
          Teleported &
          Required<TransitionAreaOut>
      >(),
      spatialChanged$: new Subject<TargetEntity & Required<Teleported>>(),
      reapedEntity$: new Subject<ReapedEntity>(),
      actionFlowComplete$: new Subject()
    };
    flowPoints.processAction$
      .pipe(
        filter(hasDamage),
        map(msg => integrity(msg, this.em))
      )
      .subscribe(flowPoints.integrityModified$);

    flowPoints.integrityModified$
      .pipe(
        map(msg => grimReaper(msg, this.em)),
        filter(hasReaped)
      )
      .subscribe(flowPoints.reapedEntity$);

    flowPoints.processAction$
      .pipe(
        filter(hasLockChange),
        map(msg => lock(msg, this.em))
      )
      .subscribe(flowPoints.lockStateChanged$);

    flowPoints.processAction$
      .pipe(
        filter(hasSpatialChange),
        map(msg => spatial(msg, this.em))
      )
      .subscribe(flowPoints.spatialChanged$);

    flowPoints.processAction$
      .pipe(
        filter(hasAreaTransition),
        map(msg => area(msg, this.em, this.areaResolver))
      )
      .subscribe(flowPoints.areaTransitioned$);

    merge(
      flowPoints.integrityModified$,
      flowPoints.lockStateChanged$,
      flowPoints.reapedEntity$,
      flowPoints.spatialChanged$,
      flowPoints.areaTransitioned$
    )
      .pipe(
        reduce((acc, curr) => {
          acc.push(curr);
          return acc;
        }, [])
      )
      .subscribe(flowPoints.actionFlowComplete$);

    return flowPoints;
  }

  public modifyActionFlow() {
    const actionInput$ = new Subject<TargetEntity & Damaged & Teleported>();
    const actionModified$ = new Subject<TargetEntity & Damaged & Teleported>();
    actionInput$
      .pipe(
        map(msg => lockQuality(msg, this.em)),
        map(msg => fireResist(msg, this.em))
      )
      .subscribe(actionModified$);
    return { actionInput$, actionModified$ };
  }

  public climbRequestFlow(protagId: EntityId) {
    const climbRequest$ = new Subject<ProtagonistEntity>();
    const climbCandidate$ = new Subject<ProtagonistEntity & TargetEntity>();
    hookEntitiesAtProtagPos(climbRequest$, climbCandidate$, this.em);

    const effectFlow = this.applyTargetedEffectFlow();

    climbCandidate$
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

    climbRequest$.next({ protagId });
    climbRequest$.complete();
    return effectFlow.outcomeDescriptions$;
  }

  public processEndOfTurn() {
    const { housekeepStart$ } = this.turnEndedFlow();
    housekeepStart$.next({});
    housekeepStart$.complete();
  }

  public housekeepingFlow() {
    const flowPoints = {
      housekeepStart$: new Subject<any>(),
      housekeepKnowledge$: new Subject<ProtagonistEntity>(),
      processSighted$: new Subject<ProtagonistEntity>(),
      entityInVision$: new Subject<ProtagonistEntity & FOVEntitiesOut>(),
      entitySeen$: new Subject<ProtagonistEntity & FOVEntitiesOut>(),
      blockageEntity$: new Subject<ProtagonistEntity>()
    };

    flowPoints.housekeepStart$.subscribe(() => console.log(`Turn ended!`));

    hookEntitiesWithComponent(
      flowPoints.housekeepStart$,
      flowPoints.blockageEntity$,
      this.em,
      Blockage
    );
    flowPoints.blockageEntity$.subscribe(msg => {
      const b = this.em.getComponent(msg.protagId, Blockage);
      if (b) {
        for (const trigger of b.triggers) {
          const x = this.em.getComponentByName(
            msg.protagId,
            trigger.componentName
          );
          if (x && x[trigger.property] === trigger.value) {
            console.log(
              `BLOCKING: trigger hit!, setting active to: ${trigger.active}`
            );
            this.em.setComponent(
              msg.protagId,
              new Blockage({ ...b, active: trigger.active })
            );
          }
        }
      }
    });

    hookEntitiesWithComponent(
      flowPoints.housekeepStart$,
      flowPoints.housekeepKnowledge$,
      this.em,
      Knowledge
    );

    flowPoints.housekeepKnowledge$.subscribe(msg => {
      const knowledge = this.em.getComponent(msg.protagId, Knowledge);
      for (const [pos, ids] of knowledge.current) {
        knowledge.history.set(pos, ids);
      }
      this.em.setComponent(
        msg.protagId,
        new Knowledge({
          current: new ValueMap(),
          history: knowledge.history
        })
      );
    });

    hookEntitiesWithComponent(
      flowPoints.housekeepStart$,
      flowPoints.processSighted$,
      this.em,
      Sighted
    );

    hookFOVEntities(
      flowPoints.processSighted$,
      flowPoints.entityInVision$,
      this.em
    );

    flowPoints.entityInVision$.subscribe(flowPoints.entitySeen$);

    flowPoints.entitySeen$.subscribe(msg => {
      const knowledge = this.em.getComponent(msg.protagId, Knowledge);
      const currentKnowledge = knowledge.current;
      let knowledgeAtPos = currentKnowledge.get(msg.viewed.atPos) || [];
      knowledgeAtPos.push(msg.viewed.entityId);
      currentKnowledge.set(msg.viewed.atPos, knowledgeAtPos);
      this.em.setComponent(
        msg.protagId,
        new Knowledge({ current: currentKnowledge, history: knowledge.history })
      );
    });
    return flowPoints;
  }
  public turnEndedFlow() {
    const houseKeeping = this.housekeepingFlow();
    houseKeeping.housekeepStart$.subscribe(this.aiTurnFlow().aiTurnStart$);

    return houseKeeping;
  }

  public aiTurnFlow() {
    const flowPoints = {
      aiTurnStart$: new Subject(),
      attackingAI$: new Subject<ProtagonistEntity>(),
      possibleAttackPosition$: new Subject<
        ProtagonistEntity & { targetPos: GridPosData }
      >(),
      aiActionsProcessed$: new Subject()
    };

    hookEntitiesWithComponent(
      flowPoints.aiTurnStart$,
      flowPoints.attackingAI$,
      this.em,
      AttackingAgent
    );

    const combatFlow = this.attackEntityFlow();
    flowPoints.attackingAI$
      .pipe(
        map(msg => acquireEntityPosition(msg, this.em)),
        map(msg =>
          radClone({
            ...radClone(msg),
            selectedPos: msg.targetPos,
            areaOfEffect: { radius: 1 }
          })
        ),
        mergeMap(msg => of(...acquireAoePositions(msg, [msg.targetPos]))),
        map(msg =>
          acquireCombatTargetAtPosition(msg, this.em, e => e.has(PlayerAgent))
        ),
        filter(hasCombatTarget)
      )
      .subscribe(combatFlow.meleeAttack$);

    combatFlow.actionFlowComplete$
      .pipe(tap(msg => console.log(`AI turn completed, doing housekeeping`)))
      .subscribe(this.housekeepingFlow().housekeepStart$);

    combatFlow.combatResult$.subscribe(msg => {
      console.log(`Combat result for AI -> ${JSON.stringify(msg, null, 2)}`);
      const pluraler = (n: number) => (n === 1 ? '' : 's');
      const attackerDescription = this.em.hasComponent(
        msg.protagId,
        Description
      )
        ? this.em.getComponent(msg.protagId, Description).short
        : 'unnamed';
      if (msg.woundSuccess) {
        this.logger(
          `The ${attackerDescription} hits you and inflicts ${
            msg.woundsInflicted
          } wound${pluraler(msg.woundsInflicted)}`
        );
      } else if (msg.strikeSuccess) {
        this.logger(
          `The ${attackerDescription} hits you but fails to cause any damage`
        );
      } else {
        this.logger(`The ${attackerDescription} misses you`);
      }
    });

    combatFlow.reapedEntity$.subscribe(msg => {
      console.log(
        `The entity was reaped: ${msg.reapedEntity} checking for player`
      );
      if (msg.reapedEntity.id === this.playerId) {
        console.log(`Player entity was reaped! Ending the game in defeat!!`);
        this.ender(EndType.DEFEAT);
      }
    });

    const housekeep = this.housekeepingFlow();
    housekeep.housekeepStart$.next();
    housekeep.housekeepStart$.complete();

    return flowPoints;
  }

  errorEncountered(message: string) {
    console.log(`System organiser encountered ERROR: ${message}`);
  }

  hookErrorReporting(obs: Observable<any>) {
    obs.subscribe({ error: msg => this.errorEncountered(msg) });
  }
}
