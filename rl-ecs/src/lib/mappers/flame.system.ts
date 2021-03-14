import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DamageData } from '../components/damage.model';
import { Flame } from '../components/flame.model';
import {
  ActiveEffect,
  Damaged,
  DamageTargetEntity,
  DamageType,
  EffectTarget,
} from '../systems.types';
import { radClone } from '../systems.utils';

export type FlameArgs = ActiveEffect &
  EffectTarget &
  Partial<Damaged> &
  Partial<DamageTargetEntity>;

export function flame(em: EntityManager) {
  return <T extends FlameArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        let damage: DamageData = msg.damage ?? null;
        let damageTargetId: EntityId = msg.damageTargetId ?? null;
        const flame = em.getComponent(msg.effectId, Flame);
        if (flame) {
          damage = { amount: flame.strength, type: DamageType.FIRE };
          damageTargetId = msg.effectTargetId;
        }
        return { ...radClone(msg), damage, damageTargetId };
      })
    );
  };
}
