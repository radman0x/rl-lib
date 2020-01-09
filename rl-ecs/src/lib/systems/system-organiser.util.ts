import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { GridPosData } from '../components/position.model';
import { hookAoeTarget } from './acquire-aoe-targets.system';
import { hookEntitiesAtPosition } from './entities-at-position.system';
import {
  hookCombatOrder,
  hookMoveOrder,
  hookPerformMove,
  hookEntitiesAtProtagPos
} from './aggregators.system';
import { burn } from './burn.system';
import { CanOccupyPositionArgs } from './can-occupy-position.system';
import { CanStandAtArgs } from './can-stand-at-position.system';
import { attachFireResist, fireResist } from './fire-resist.system';
import { freeze } from './freeze.system';
import { grimReaper } from './grim-reaper.system';
import { integrity, IntegrityArgs } from './integrity.system';
import { PositionNextToEntityArgs } from './position-next-to-entity.system';
import { hookSingleTarget } from './single-target.system';
import {
  ActiveEffect,
  CombatTarget,
  Damaged,
  EffectStart,
  EnteredPos,
  ProtagonistEntity,
  TargetEntity,
  TargetPos,
  Collected
} from './systems.types';
import { hookAddToInventory } from './add-to-inventory.system';
import { LoggerService } from 'src/app/logger.service';
import { hasDamage, hasLockChange } from './systems.utils';
import { toggleLock } from './toggle-lock.system';
import { lock } from './lock.system';
import { blocking } from './blocking.system';

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

  constructor(private em: EntityManager, private logger: LoggerService) {
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
  }
}
