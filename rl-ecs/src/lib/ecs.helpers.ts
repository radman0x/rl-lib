import { EntityId, EntityManager, Entity } from 'rad-ecs';
import { Description } from './components/description.model';

export function descriptionOrUnnamed(
  entity: EntityId | Entity,
  em: EntityManager
): string {
  if (entity instanceof Entity) {
    return entity.has(Description)
      ? entity.component(Description).short
      : 'unnamed';
  } else {
    return em.hasComponent(entity, Description)
      ? em.getComponent(entity, Description).short
      : 'unnamed';
  }
}
