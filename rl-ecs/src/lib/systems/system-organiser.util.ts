import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { GridPosData, GridPos } from '../components/position.model';
import { Logger } from '../ecs.types';
import { hookAoeTarget } from './acquire-aoe-targets.system';
import { hookAddToInventory } from './add-to-inventory.system';
import {
  hookCombatOrder,
  hookEntitiesAtProtagPos,
  hookMoveOrder,
  hookPerformMove
} from './aggregators.system';
import { blocking } from './blocking.system';
import { burn } from './burn.system';
import { CanOccupyPositionArgs } from './can-occupy-position.system';
import { CanStandAtArgs } from './can-stand-at-position.system';
import { hookEntitiesAtPosition } from './entities-at-position.system';
import { fireResist } from './fire-resist.system';
import { freeze } from './freeze.system';
import { grimReaper } from './grim-reaper.system';
import { integrity } from './integrity.system';
import { lock } from './lock.system';
import { PositionNextToEntityArgs } from './position-next-to-entity.system';
import { hookSingleTarget } from './single-target.system';
import {
  ActiveEffect,
  Collected,
  CombatTarget,
  Damaged,
  EffectStart,
  EnteredPos,
  ProtagonistEntity,
  TargetEntity,
  TargetPos
} from './systems.types';
import { hasDamage, hasLockChange, radClone } from './systems.utils';
import { toggleLock } from './toggle-lock.system';
import { hookEntitiesWithComponent } from './entities-with-component.system';
import { Sighted } from '../components/sighted.model';
import { hookFOVEntities, FOVEntitiesOut } from './fov-entities.system';
import { Knowledge, KnownState } from '../components/knowledge.model';
import { ValueMap } from '@rad/rl-utils';

export class SystemOrganiser {
  aoeTargetPositions: Observable<{ targetPos: GridPosData } & EffectStart>;
  animationSystem: Observable<{ effectId: EntityId }>;
  applyDamageSystem: Observable<{}>;

  public readonly applyEffect$ = new Subject<EffectStart>();

  public readonly effectAtPosition$ = new Subject<TargetPos & ActiveEffect>();
  public readonly effectOnEntity$ = new Subject<TargetEntity & ActiveEffect>();
  public readonly effectProduced$ = new Subject<
    Damaged & TargetEntity & ActiveEffect
  >();
  public readonly effectModified$ = new Subject<
    Damaged & TargetEntity & ActiveEffect
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

  constructor(private em: EntityManager, private logger: Logger) {
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

    hookSingleTarget(this.applyEffect$, this.effectAtPosition$, this.em);
    hookAoeTarget(this.applyEffect$, this.effectAtPosition$, this.em);

    hookEntitiesAtPosition(
      this.effectAtPosition$,
      this.effectOnEntity$,
      this.em
    );

    merge(
      this.effectOnEntity$.pipe(map(msg => burn(msg, this.em))),
      this.effectOnEntity$.pipe(map(msg => freeze(msg, this.em))),
      this.effectOnEntity$.pipe(map(msg => toggleLock(msg, this.em)))
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
