import { EntityManager, EntityId } from 'rad-ecs';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { CompassDirection } from '../ecs.types';
import {
  acquireAoeTargets,
  AcquireAOETargetsArgs,
  AcquireAoeTargetsOut
} from './acquire-aoe-targets.system';
import { acquireCombatTargetAtPosition } from './acquire-combat-target-at-position.system';
import {
  calculateEffectDamage,
  CalculateEffectDamageArgs
} from './calculate-effect-damage.system';
import { canOccupyPosition } from './can-occupy-position.system';
import { canStandAtPosition } from './can-stand-at-position.system';
import { positionNextToEntity } from './position-next-to-entity.system';
import { resistEffectDamage } from './resist-effect-damage.system';
import { sustainDamage } from './sustain-damage.system';
import { aoeAnimation } from './system.utils';
import { ProtagonistEntity } from './systems.types';
import { GridPos } from '../components/position.model';
import { AreaOfEffect } from '../components/area-of-effect.model';
import { Burn } from '../components/burn.model';
import { DamageType } from '../components/damage.model';
import { grimReaper } from './grim-reaper.system';

export class SystemOrganiser {
  effectSystem = new Subject<ProcessEffectArgs>();
  aoeEffect: Observable<ProcessEffectArgs & AcquireAOETargetsArgs>;
  aoeDamageTargets: Observable<{ targetId: EntityId } & ProcessEffectArgs>;
  animationSystem: Observable<{ effectId: EntityId }>;
  applyDamageSystem: Observable<{}>;

  constructor(private em: EntityManager) {
    this.aoeEffect = this.effectSystem.pipe(
      tap(msg => console.log(`starting aoe calc`)),
      filter(msg => this.em.hasComponent(msg.effectId, AreaOfEffect)),
      map(msg => ({
        ...msg,
        aoeComponent: this.em.getComponent(msg.effectId, AreaOfEffect)!
      })),
      map(msg => ({
        ...msg,
        aoeCenter: msg.targetPos,
        aoeRadius: msg.aoeComponent.radius
      }))
    );

    this.aoeDamageTargets = this.aoeEffect.pipe(
      mergeMap(msg => of(...acquireAoeTargets(msg, this.em)))
    );

    this.applyDamageSystem = this.aoeDamageTargets.pipe(
      tap(msg => console.log(`got a target`)),
      filter(msg => this.em.hasComponent(msg.effectId, Burn)),
      map(msg => ({
        ...msg,
        damageTarget: {
          amount: this.em.getComponent(msg.effectId, Burn)!.intensity,
          type: DamageType.FIRE
        }
      })),
      map(msg => calculateEffectDamage(msg, this.em)),
      map(msg => resistEffectDamage(msg, this.em)),
      map(msg => sustainDamage(msg, this.em)),
      map(msg => grimReaper(msg, this.em))
    );
    this.applyDamageSystem.subscribe(msg => {});

    this.animationSystem = this.aoeEffect.pipe(
      tap(msg => console.log(this.em.get(msg.effectId))),
      filter(msg => this.em.hasComponent(msg.effectId, Burn)),
      tap(msg => console.log(msg)),
      aoeAnimation(this.em, 'Effect0-144.png')
    );
    this.animationSystem.subscribe(msg => console.log(`Animation system END`));
  }

  hookBumpMoveSystem(
    source: Observable<ProtagonistEntity & { direction: CompassDirection }>
  ) {
    const targetSelected = source.pipe(
      map(msg => positionNextToEntity(msg, this.em)),
      map(msg => acquireCombatTargetAtPosition(msg, this.em))
    );

    const move = targetSelected.pipe(
      filter(msg => msg.combatTargetId === undefined),
      map(msg => canOccupyPosition(msg, this.em)),
      map(msg => canStandAtPosition(msg, this.em))
    );

    const combat = targetSelected.pipe(
      filter(msg => msg.combatTargetId !== undefined)
    );

    return { move, combat };
  }

  hookThrowFireballSystem<T_Args extends AcquireAOETargetsArgs>(
    source: Observable<T_Args>
  ) {
    return source.pipe(
      aoeAnimation(this.em, 'Effect0-144.png'),
      mergeMap(msg => of(...acquireAoeTargets(msg, this.em)))
    );
  }

  hookApplyDamageSystem<T_Args extends CalculateEffectDamageArgs>(
    source: Observable<T_Args>
  ) {
    return source.pipe(
      map(msg => calculateEffectDamage(msg, this.em)),
      map(msg => resistEffectDamage(msg, this.em)),
      map(msg => sustainDamage(msg, this.em))
    );
  }

  hookEffectHandlerSystem() {
    return this.effectSystem;
  }
}

export interface ProcessEffectArgs {
  effectId: EntityId;
  targetPos: GridPos;
}
