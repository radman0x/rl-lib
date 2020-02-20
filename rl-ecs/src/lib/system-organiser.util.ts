import { ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { Climbable } from './components/climbable.model';
import { Knowledge } from './components/knowledge.model';
import { GridPosData } from './components/position.model';
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
  hasClimbable,
  hasDamage,
  hasLockChange,
  hasSpatialChange,
  radClone,
  hasAreaTransition
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
import { blocking } from './systems/blocking.system';
import { burn } from './systems/burn.system';
import { CanOccupyPositionArgs } from './systems/can-occupy-position.system';
import { CanStandAtArgs } from './systems/can-stand-at-position.system';
import { hookEntitiesAtPosition } from './systems/entities-at-position.system';
import { hookEntitiesWithComponent } from './systems/entities-with-component.system';
import { fireResist } from './systems/fire-resist.system';
import { FOVEntitiesOut, hookFOVEntities } from './systems/fov-entities.system';
import { freeze } from './systems/freeze.system';
import { grimReaper } from './systems/grim-reaper.system';
import { integrity } from './systems/integrity.system';
import { lock } from './systems/lock.system';
import { PositionNextToEntityArgs } from './systems/position-next-to-entity.system';
import { hookSingleTarget } from './systems/single-target.system';
import { spatial } from './systems/spatial.system';
import { teleport } from './systems/teleport.system';
import { toggleLock } from './systems/toggle-lock.system';
import { transitionArea } from './systems/transition-area.system';
import { AreaResolver } from './area-resolver.model';
import { area } from './systems/area.system';

export class SystemOrganiser {
  aoeTargetPositions: Observable<{ targetPos: GridPosData } & EffectStart>;
  animationSystem: Observable<{ effectId: EntityId }>;
  applyDamageSystem: Observable<{}>;

  public readonly applyTargetedEffect$ = new Subject<EffectStart>();

  public readonly effectAtPosition$ = new Subject<TargetPos & ActiveEffect>();
  public readonly effectOnEntity$ = new Subject<TargetEntity & ActiveEffect>();
  public readonly effectProduced$ = new Subject<
    Damaged & TargetEntity & ActiveEffect
  >();
  public readonly effectModified$ = new Subject<
    Damaged & TargetEntity & ActiveEffect & Teleported
  >();
  public readonly integrityModified$ = new Subject<TargetEntity>();

  public readonly moveRequest$ = new Subject<PositionNextToEntityArgs>();

  public readonly meleeAttack$ = new Subject<
    CombatTarget & ProtagonistEntity
  >();
  public readonly tileEntered$ = new Subject<{}>();

  public singleTargetAttempt = new Subject<{
    selectedPos?: GridPosData;
    effectId: EntityId;
  }>();
  public singleTargetAction: Observable<{
    targetPos: GridPosData;
    effectId: EntityId;
  }>;

  public aoeTargetAttempt = new Subject<{
    selectedPos?: GridPosData;
    effectId: EntityId;
  }>();
  public aoeTargetAction: Observable<{
    targetPos: GridPosData;
    effectId: EntityId;
  }>;

  public moveOrdered$ = new Subject<CanOccupyPositionArgs & CanStandAtArgs>();
  public movePerformed$ = new Subject<ProtagonistEntity & EnteredPos>();

  public requestCollectLocal$ = new Subject<ProtagonistEntity>();
  public performCollection$ = new Subject<ProtagonistEntity & TargetEntity>();
  public entityCollected$ = new Subject<
    ProtagonistEntity & TargetEntity & Collected
  >();

  public turnEnded$ = new Subject();
  public houseKeepKnowledge$ = new Subject<ProtagonistEntity>();
  public processSighted$ = new Subject<ProtagonistEntity>();
  public entityInVision$ = new Subject<ProtagonistEntity & FOVEntitiesOut>();
  public entitySeen$ = new Subject<ProtagonistEntity & FOVEntitiesOut>();

  public climbRequest$ = new Subject<ProtagonistEntity>();
  public climbOrdered$ = new Subject<ProtagonistEntity & TargetEntity>();

  public effectOnEnvironment$ = new Subject<ActiveEffect>();

  public areaTransitioned$ = new Observable<{ viewerEntity: EntityId }>();

  constructor(
    private em: EntityManager,
    private logger: Logger,
    private areaResolver: AreaResolver
  ) {
    hookEntitiesAtProtagPos(
      this.requestCollectLocal$,
      this.performCollection$,
      this.em
    );
    hookAddToInventory(
      this.performCollection$,
      this.entityCollected$,
      this.em,
      this.logger
    );
    hookMoveOrder(this.moveRequest$, this.moveOrdered$, this.em);
    hookCombatOrder(this.moveRequest$, this.meleeAttack$, this.em);
    hookPerformMove(this.moveOrdered$, this.movePerformed$, this.em);

    hookSingleTarget(
      this.applyTargetedEffect$,
      this.effectAtPosition$,
      this.em
    );
    hookAoeTarget(this.applyTargetedEffect$, this.effectAtPosition$, this.em);

    hookEntitiesAtPosition(
      this.effectAtPosition$,
      this.effectOnEntity$,
      this.em
    );

    merge(
      this.effectOnEntity$.pipe(map(msg => burn(msg, this.em))),
      this.effectOnEntity$.pipe(map(msg => freeze(msg, this.em))),
      this.effectOnEntity$.pipe(map(msg => toggleLock(msg, this.em))),
      this.effectOnEntity$.pipe(map(msg => teleport(msg, this.em))),
      this.effectOnEntity$.pipe(map(msg => transitionArea(msg, this.em)))
    ).subscribe(this.effectProduced$);

    this.effectProduced$
      .pipe(map(msg => fireResist(msg, this.em)))
      .subscribe(this.effectModified$);

    this.effectModified$
      .pipe(
        filter(hasDamage),
        map(msg => integrity(msg, this.em))
      )
      .subscribe(this.integrityModified$);

    this.integrityModified$
      .pipe(tap(msg => grimReaper(msg, this.em)))
      .subscribe(() => {});

    this.effectModified$
      .pipe(
        filter(hasLockChange),
        map(msg => lock(msg, this.em))
      )
      .subscribe(() => {});

    this.effectModified$
      .pipe(map(msg => blocking(msg, this.em)))
      .subscribe(() => {});

    this.effectModified$
      .pipe(
        filter(hasSpatialChange),
        map(msg => spatial(msg, this.em))
      )
      .subscribe(this.turnEnded$);

    this.areaTransitioned$ = this.effectModified$.pipe(
      tap(msg => console.log(`Checking for area transition`)),
      filter(hasAreaTransition),
      map(msg => area(msg, this.em, this.areaResolver)),
      tap(msg => console.log(`Area transitioned`))
    );

    this.movePerformed$.subscribe(this.turnEnded$);

    this.turnEnded$.subscribe(msg => console.log(`turn ended!`));
    hookEntitiesWithComponent(
      this.turnEnded$,
      this.houseKeepKnowledge$,
      em,
      Knowledge
    );

    this.houseKeepKnowledge$.subscribe(msg => {
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
      this.turnEnded$,
      this.processSighted$,
      em,
      Sighted
    );

    hookFOVEntities(this.processSighted$, this.entityInVision$, em);

    this.entityInVision$.subscribe(this.entitySeen$);

    this.entitySeen$.subscribe(msg => {
      const knowledge = em.getComponent(msg.protagId, Knowledge);
      const currentKnowledge = knowledge.current;
      let knowledgeAtPos = currentKnowledge.get(msg.viewed.atPos) || [];
      knowledgeAtPos.push(msg.viewed.entityId);
      currentKnowledge.set(msg.viewed.atPos, knowledgeAtPos);
      em.setComponent(
        msg.protagId,
        new Knowledge({ current: currentKnowledge, history: knowledge.history })
      );
    });

    const climbCandidate$ = new Subject<ProtagonistEntity & TargetEntity>();
    hookEntitiesAtProtagPos(this.climbRequest$, climbCandidate$, this.em);

    climbCandidate$
      .pipe(
        mergeMap(msg => of(...acquireEffects(msg, em))),
        filter(msg => em.hasComponent(msg.effectId, Climbable)),
        map(msg => ({
          ...radClone(msg),
          climbable: em.getComponent(msg.effectId, Climbable)
        })),
        filter(msg => hasClimbable(msg)),
        map(msg => ({ ...radClone(msg), targetId: msg.protagId })),
        tap(msg => console.log(JSON.stringify(msg, null, 2)))
      )
      .subscribe(this.effectOnEntity$);

    this.hookErrorReporting(this.movePerformed$);
    this.hookErrorReporting(this.performCollection$);
    this.hookErrorReporting(this.entityCollected$);
    this.hookErrorReporting(this.effectProduced$);
    this.hookErrorReporting(this.effectModified$);
    this.hookErrorReporting(this.integrityModified$);
    this.hookErrorReporting(this.turnEnded$);
    this.hookErrorReporting(this.processSighted$);
    this.hookErrorReporting(this.entityInVision$);
    this.hookErrorReporting(this.entityInVision$);
  }

  errorEncountered(message: string) {
    console.log(`System organiser encountered ERROR: ${message}`);
  }

  hookErrorReporting(obs: Observable<any>) {
    obs.subscribe({ error: msg => this.errorEncountered(msg) });
  }
}
