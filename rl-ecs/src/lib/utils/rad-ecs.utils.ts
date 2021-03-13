import { ComponentConstructor, Entity, EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Abilities } from '../components/abilities.model';
import { Effects } from '../components/effects.model';
import { Inventory } from '../components/inventory.model';
import { MemberOf } from '../components/member-of.model';
import { StatusEffects } from '../components/status-effects.model';

export function findComponentInEntityChain<
  T_Component extends ComponentConstructor
>(em: EntityManager, id: EntityId, c: T_Component): EntityId | null {
  if (em.hasComponent(id, c)) {
    return id;
  } else if (em.hasComponent(id, MemberOf)) {
    return findComponentInEntityChain(em, em.getComponent(id, MemberOf).id, c);
  } else {
    return null;
  }
}

function observeContents<
  T extends
    | typeof Inventory
    | typeof Effects
    | typeof Abilities
    | typeof StatusEffects
>(id: EntityId, em: EntityManager, componentType: T) {
  return em
    .getComponent(id, componentType)
    .contents.map((effectId) => recursiveObserveEntity(effectId, em));
}

export function recursiveObserveEntity(
  id: EntityId,
  em: EntityManager
): Observable<Entity | null> {
  const base = em.observeEntity$(id);
  const entityObservables: Observable<Entity | null>[] = [base];

  if (em.hasComponent(id, Inventory)) {
    entityObservables.push(...observeContents(id, em, Inventory));
  }
  if (em.hasComponent(id, Effects)) {
    entityObservables.push(...observeContents(id, em, Effects));
  }
  if (em.hasComponent(id, Abilities)) {
    entityObservables.push(...observeContents(id, em, Abilities));
  }
  if (em.hasComponent(id, StatusEffects)) {
    entityObservables.push(...observeContents(id, em, StatusEffects));
  }
  return merge(...entityObservables).pipe(debounceTime(50));
}
