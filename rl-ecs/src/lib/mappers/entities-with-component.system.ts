import { ComponentConstructor, EntityId, EntityManager } from 'rad-ecs';
import { addProperty, PropObject } from '../systems.utils';
import { Id } from '@rad/rl-applib';

interface Args {
  componentTypes: ComponentConstructor[];
}
export type EntitiesWithComponentArgs = Args;

export function entitiesWithComponents<T extends Args, K extends string>(
  msg: T,
  em: EntityManager,
  outKey: K
): Id<T & PropObject<K, EntityId>>[] {
  const matches = em.matching(...msg.componentTypes);
  if (matches.length === 0) {
    return [addProperty(msg, outKey, null)];
  }
  return matches.map(e => addProperty(msg, outKey, e.id));
}
