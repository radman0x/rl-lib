import { CompassDirection, ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators';
import { AreaResolver } from './area-resolver.model';
import { Blockage } from './components/blockage.model';
import { Climbable } from './components/climbable.model';
import { Description } from './components/description.model';
import { EndType } from './components/end-state.model';
import { Knowledge } from './components/knowledge.model';
import { Sighted } from './components/sighted.model';
import { Logger } from './ecs.types';
import {
  ActiveEffect,
  Collected,
  CombatTarget,
  Damaged,
  EffectStart,
  EnteredPos,
  ProtagonistEntity,
  TargetEntity,
  TargetPos,
  Teleported
} from './systems.types';
import {
  hasAreaTransition,
  hasClimbable,
  hasDamage,
  hasLockChange,
  hasOutcomeDescription,
  hasSpatialChange,
  radClone
} from './systems.utils';
import { hookAoeTarget } from './systems/acquire-aoe-targets.system';
import { acquireEffects } from './systems/acquire-effects.system';
import { hookAddToInventory } from './systems/add-to-inventory.system';
import {
  hookCombatOrder,
  hookEntitiesAtProtagPos,
  hookMoveOrder,
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
import { PositionNextToEntityArgs } from './systems/position-next-to-entity.system';
import { hookSingleTarget } from './systems/single-target.system';
import { spatial } from './systems/spatial.system';
import { teleport } from './systems/teleport.system';
import { toggleLock } from './systems/toggle-lock.system';
import {
  transitionArea,
  TransitionAreaOut
} from './systems/transition-area.system';

export class SystemOrganiser {
  public runTargetedEffectFlow(effectStart: EffectStart) {
    this.applyTargetedEffectFlow().applyTargetedEffect$.next(effectStart);
  }

  public applyTargetedEffectFlow() {
    const flowPoints = {
      applyTargetedEffect$: new Subject<EffectStart>(),
      effectAtPosition$: new Subject<TargetPos & ActiveEffect>(),
      effectOnEntity$: new Subject<TargetEntity & ActiveEffect>(),
      effectProduced$: new Subject<Damaged & TargetEntity & ActiveEffect>(),
      effectModified$: new Subject<
        Damaged & TargetEntity & ActiveEffect & Teleported
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
      outcomeDescriptions$: new ReplaySubject<
        { worldStateChangeDescription: string; activeEffectDescription }[]
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

    merge(
      flowPoints.effectOnEntity$.pipe(
        map(msg => endState(msg, this.em, this.ender))
      ),
      flowPoints.effectOnEntity$.pipe(map(msg => burn(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => freeze(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => toggleLock(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => teleport(msg, this.em))),
      flowPoints.effectOnEntity$.pipe(map(msg => transitionArea(msg, this.em)))
    ).subscribe(flowPoints.effectProduced$);

    flowPoints.effectProduced$
      .pipe(map(msg => fireResist(msg, this.em)))
      .pipe(map(msg => lockQuality(msg, this.em)))
      .subscribe(flowPoints.effectModified$);

    flowPoints.effectModified$
      .pipe(
        filter(hasDamage),
        map(msg => integrity(msg, this.em))
      )
      .subscribe(flowPoints.integrityModified$);

    flowPoints.integrityModified$
      .pipe(tap(msg => grimReaper(msg, this.em)))
      .subscribe(() => {});

    flowPoints.effectModified$
      .pipe(
        filter(hasLockChange),
        map(msg => lock(msg, this.em))
      )
      .subscribe(flowPoints.lockStateChanged$);

    flowPoints.effectModified$
      .pipe(
        filter(hasSpatialChange),
        map(msg => spatial(msg, this.em))
      )
      .subscribe(flowPoints.spatialChanged$);

    flowPoints.effectModified$
      .pipe(
        filter(hasAreaTransition),
        map(msg => area(msg, this.em, this.areaResolver))
      )
      .subscribe(flowPoints.areaTransitioned$);

    merge(flowPoints.lockStateChanged$, flowPoints.areaTransitioned$)
      .pipe(
        tap(msg => `OUTCOME: ${console.log(JSON.stringify(msg, null, 2))}`),
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

  climbRequestFlow(protagId: EntityId) {
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

  processEndOfTurn() {
    this.turnEndedFlow().turnEnded$.next({});
  }

  turnEndedFlow() {
    const flowPoints = {
      turnEnded$: new Subject<any>(),
      housekeepKnowledge$: new Subject<ProtagonistEntity>(),
      processSighted$: new Subject<ProtagonistEntity>(),
      entityInVision$: new Subject<ProtagonistEntity & FOVEntitiesOut>(),
      entitySeen$: new Subject<ProtagonistEntity & FOVEntitiesOut>(),
      blockageEntity$: new Subject<ProtagonistEntity>()
    };

    flowPoints.turnEnded$.subscribe(() => console.log(`turn ended!`));

    hookEntitiesWithComponent(
      flowPoints.turnEnded$,
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
      flowPoints.turnEnded$,
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
      flowPoints.turnEnded$,
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

  constructor(
    private em: EntityManager,
    private logger: Logger,
    private areaResolver: AreaResolver,
    private ender: (et: EndType) => void
  ) {}

  collectItemFlow(protagId: EntityId) {
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

  orderMoveFlow(protagId: EntityId, direction: CompassDirection) {
    const moveRequest$ = new Subject<PositionNextToEntityArgs>();
    const moveOrdered$ = new Subject<CanOccupyPositionArgs & CanStandAtArgs>();
    const meleeAttack$ = new Subject<CombatTarget & ProtagonistEntity>();
    const positionEntered$ = new ReplaySubject<
      ProtagonistEntity & EnteredPos
    >();
    const entitiesAtNewPos$ = new Subject<ProtagonistEntity & TargetEntity>();
    const noteworthyAtNeWPos$ = new ReplaySubject<
      (ProtagonistEntity & TargetEntity)[]
    >();
    hookMoveOrder(moveRequest$, moveOrdered$, this.em);
    hookCombatOrder(moveRequest$, meleeAttack$, this.em);
    hookPerformMove(moveOrdered$, positionEntered$, this.em);

    hookEntitiesAtProtagPos(positionEntered$, entitiesAtNewPos$, this.em);
    entitiesAtNewPos$
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
      .subscribe(noteworthyAtNeWPos$);

    moveRequest$.next({ protagId, direction });
    moveRequest$.complete();
    return { positionEntered$, noteworthyAtNeWPos$ };
  }

  errorEncountered(message: string) {
    console.log(`System organiser encountered ERROR: ${message}`);
  }

  hookErrorReporting(obs: Observable<any>) {
    obs.subscribe({ error: msg => this.errorEncountered(msg) });
  }
}
