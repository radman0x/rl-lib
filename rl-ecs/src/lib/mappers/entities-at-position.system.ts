import { Id } from '@rad/rl-applib';
import { Entity, EntityManager } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { TargetPos } from '../systems.types';
import { addProperty, PropObject } from '../systems.utils';

type Args = TargetPos;
export type EntitiesAtPositionArgs = Args;

type TargetPredicate = (entity: Entity) => boolean;

export function entitiesAtPosition<T extends Args, K extends string>(
  msg: T,
  em: EntityManager,
  outKey: K,
  predicate?: TargetPredicate
): Id<T & PropObject<K, EntityId | null>>[] {
  const targetIds: EntityId[] = [];
  for (const candidate of em.matchingIndex(new GridPos(msg.targetPos))) {
    if (predicate && !predicate(candidate)) {
      continue;
    }
    targetIds.push(candidate.id);
  }
  if (targetIds.length === 0) {
    return [addProperty(msg, outKey, null)];
  }

  return targetIds.map((id) => addProperty(msg, outKey, id));
}
