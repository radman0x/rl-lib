import { ComponentConstructor, Entity, EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of } from 'rxjs';
import { expand, map, mergeMap, takeLast, tap, toArray } from 'rxjs/operators';
import { ArmorDelta } from '../components/armor-delta.model';
import { Armor } from '../components/armor.model';
import { Equipped } from '../components/equipped.model';
import { Inventory } from '../components/inventory.model';
import { Mental, MentalOverride } from '../components/mental.model';
import { ModifierPriority } from '../components/modifier-priority.model';
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
      ...[
        ...msg.working.allComponents().map((e) => e.component),
        new modifyType({ count: curr.count + delta.change }),
      ]
    );
  }

  return msg;
}

function overrideValue<
  T extends ModifierPipeInput,
  U extends typeof Mental,
  V extends typeof MentalOverride
>(msg: T, em: EntityManager, modifyType: U, overrideType: V) {
  if (
    msg.working.has(modifyType) &&
    em.hasComponent(msg.modifierId, overrideType)
  ) {
    const override = em.getComponent(msg.modifierId, overrideType);
    msg.working = new Entity(
      null,
      ...[
        ...msg.working.allComponents().map((e) => e.component),
        new modifyType({ ...override }),
      ]
    );
  }

  return msg;
}

export function modifiers<
  T extends Args,
  U extends typeof Inventory | typeof StatusEffects,
  V extends typeof Equipped | typeof PassiveEffect
>(
  msg: T,
  em: EntityManager,
  containerType: U,
  signalComponent: V
): Observable<EntityId> {
  return of(msg).pipe(
    mergeMap((msg) => {
      if (em.hasComponent(msg.modifyId, containerType)) {
        const container = em.getComponent(msg.modifyId, containerType);
        return of(
          ...container.contents.filter((id) =>
            em.hasComponent(id, signalComponent)
          )
        );
      } else {
        return of() as Observable<EntityId>;
      }
    })
  );
}

export function modifieredEntity<T extends Args>(msg: T, em: EntityManager) {
  let finalEntity = msg.working;
  of(msg)
    .pipe(
      mergeMap((msg) =>
        merge(
          modifiers(msg, em, Inventory, Equipped),
          modifiers(msg, em, StatusEffects, PassiveEffect)
        ).pipe(
          toArray(),
          tap((arr) => {
            const getScore = (id) =>
              em.hasComponent(id, ModifierPriority)
                ? em.getComponent(id, ModifierPriority).score
                : 0;
            arr.sort((lhs, rhs) => {
              const leftScore = getScore(lhs);
              const rightScore = getScore(rhs);
              return leftScore - rightScore;
            });
          }),
          map((arr) => ({ ...msg, modifiers: arr }))
        )
      ),
      expand((msg) => {
        if (msg.modifiers.length !== 0) {
          return of({ ...msg, modifierId: msg.modifiers.pop() }).pipe(
            map((msg) => deltaValue(msg, em, Strength, StrengthDelta)),
            map((msg) => deltaValue(msg, em, WeaponSkill, WeaponSkillDelta)),
            map((msg) => deltaValue(msg, em, Armor, ArmorDelta)),
            map((msg) => overrideValue(msg, em, Mental, MentalOverride))
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
): InstanceType<T> | null {
  if (!em.hasComponent(id, c)) {
    return null;
  }
  const comp = em.getComponent(id, c);
  return modifieredEntity(
    { modifyId: id, working: new Entity(null, comp) },
    em
  ).component(c);
}
