import { ComponentConstructor, EntityManager, EntityId } from 'rad-ecs';
import { Modifier, AdjustType } from '../components/modifier.model';
import { StatusEffects } from '../components/status-effects.model';

export function getModifiedComponent<T_Component extends ComponentConstructor>(
  em: EntityManager,
  id: EntityId,
  c: T_Component
): InstanceType<T_Component> | null {
  if (!em.hasComponent(id, c)) {
    return null;
  }
  const component = em.getComponent(id, c);
  if (em.hasComponent(id, StatusEffects)) {
    em.getComponent(id, StatusEffects)
      .list.filter((seId) => em.hasComponent(seId, Modifier))
      .map((seId) => em.getComponent(seId, Modifier).entries)
      .flat()
      .forEach((modifier) => {
        switch (modifier.adjustType) {
          case AdjustType.REPLACE:
            if (modifier.type === c) {
              component[modifier.property] = modifier.adjustValue;
            }
            break;
        }
      });
  }

  return component as InstanceType<T_Component>;
}