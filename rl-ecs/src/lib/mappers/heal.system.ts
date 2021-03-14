import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DamageData } from '../components/damage.model';
import { Heal } from '../components/heal.model';
import {
  ActiveEffect,
  Damaged,
  DamageType,
  EffectTarget,
} from '../systems.types';
import { radClone } from '../systems.utils';

export type HealArgs = ActiveEffect & EffectTarget;

export function heal(em: EntityManager) {
  return <T extends HealArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        let damage: DamageData = null;
        let damageTargetId: EntityId = null;
        const heal = em.getComponent(msg.effectId, Heal);
        if (heal) {
          damage = { amount: -heal.amount, type: DamageType.MAGICAL };
          damageTargetId = msg.effectTargetId;
        }
        return { ...radClone(msg), damage, damageTargetId };
      })
    );
  };
}
