import { ComponentConstructor, EntityId, EntityManager } from 'rad-ecs';
import { addProperty, PropObject } from '../systems.utils';

// export function hookEntitiesWithComponents<T>(
//   source: Observable<T>,
//   dest: Subject<EntitiesWithComponentOut & T>,
//   em: EntityManager,
//   ...componentTypes: ComponentConstructor[]
// ) {
//   source
//     .pipe(
//       map(msg => ({ ...radClone(msg), componentTypes })),
//       mergeMap(msg => of(...entitiesWithComponents(msg, em)))
//     )
//     .subscribe(dest);
// }

interface Args {
  componentTypes: ComponentConstructor[];
}
export type EntitiesWithComponentArgs = Args;

export function entitiesWithComponents<T extends Args, K extends string>(
  msg: T,
  em: EntityManager,
  outKey: K
) {
  const matches = em.matching(...msg.componentTypes);
  if (matches.length === 0) {
    return [addProperty(msg, outKey, null)];
  }
  return matches.map(e => addProperty(msg, outKey, e.id)) as (T &
    PropObject<K, EntityId>)[];
}
