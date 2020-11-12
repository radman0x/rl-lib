import { ComponentConstructor, Entity, EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of } from 'rxjs';
import { expand, map, mergeMap, takeLast, toArray } from 'rxjs/operators';
import { Equipped } from '../components/equipped.model';
import { Inventory } from '../components/inventory.model';
import { PassiveEffect } from '../components/passive-effect.model';
import { StatusEffects } from '../components/status-effects.model';
import { StrengthDelta } from '../components/strength-delta.model';
import { Strength } from '../components/strength.model';
import { WeaponSkillDelta } from '../components/weapon-skill-delta.model';
import { WeaponSkill } from '../components/weapon-skill.model';

type Args = { modifyId: EntityId; working: Entity };
type ModifierPipeInput = Args & { modifierId: EntityId };
function deltaValue<
  T extends ModifierPipeInput,
  U extends typeof Strength | typeof WeaponSkill,
  V extends typeof StrengthDelta | typeof WeaponSkillDelta
>(msg: T, em: EntityManager, modifyType: U, deltaType: V) {
  if (
    msg.working.has(modifyType) &&
    em.hasComponent(msg.modifierId, deltaType)
  ) {
    const curr = msg.working.component(modifyType);
    const delta = em.getComponent(msg.modifierId, deltaType);
    msg.working = new Entity(
      null,
      new modifyType({ count: curr.count + delta.change })
    );
  }

  return msg;
}

export function inventoryModifiers<T extends Args>(
  msg: T,
  em: EntityManager
): Observable<number> {
  return of(msg).pipe(
    mergeMap((msg) => {
      if (em.hasComponent(msg.modifyId, Inventory)) {
        const inv = em.getComponent(msg.modifyId, Inventory);
        return of(
          ...inv.contents.filter((id) => em.hasComponent(id, Equipped))
        );
      } else {
        return of() as Observable<number>;
      }
    })
  );
}

export function statusEffectModifiers<T extends Args>(
  msg: T,
  em: EntityManager
): Observable<number> {
  return of(msg).pipe(
    mergeMap((msg) => {
      if (em.hasComponent(msg.modifyId, StatusEffects)) {
        const statusEffects = em.getComponent(msg.modifyId, StatusEffects);
        return of(
          ...statusEffects.contents.filter((id) =>
            em.hasComponent(id, PassiveEffect)
          )
        );
      } else {
        return of() as Observable<number>;
      }
    })
  );
}

export function modifieredEntity<T extends Args>(msg: T, em: EntityManager) {
  let finalEntity = msg.working;
  of(msg)
    .pipe(
      mergeMap((msg) =>
        merge(statusEffectModifiers(msg, em), inventoryModifiers(msg, em)).pipe(
          toArray(),
          map((arr) => ({ ...msg, modifiers: arr }))
        )
      ),
      expand((msg) => {
        if (msg.modifiers.length !== 0) {
          return of({ ...msg, modifierId: msg.modifiers.pop() }).pipe(
            map((msg) => deltaValue(msg, em, Strength, StrengthDelta)),
            map((msg) => deltaValue(msg, em, WeaponSkill, WeaponSkillDelta))
          );
        } else {
          return of();
        }
      }),
      takeLast(1)
    )
    .subscribe((msg) => {
      finalEntity = msg.working;
    });

  return finalEntity;
}

export function getModifiedComponent<T extends ComponentConstructor>(
  id: EntityId,
  c: T,
  em: EntityManager
) {
  const comp = em.getComponent(id, c);
  return modifieredEntity(
    { modifyId: id, working: new Entity(null, comp) },
    em
  ).component(c);
}
