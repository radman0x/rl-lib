import { Id } from '@rad/rl-applib';
import { Entity, EntityManager } from 'rad-ecs';
import { GridPos, GridPosData } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { addProperty, PropObject } from '../systems.utils';

interface Args {
  targetPos: GridPosData;
}
export type EntitiesAtPositionArgs = Args;

type TargetPredicate = (entity: Entity) => boolean;

export function entitiesAtPosition<T extends Args, K extends string>(
  msg: T,
  em: EntityManager,
  outKey: K,
  predicate?: TargetPredicate
): Id<T & PropObject<K, EntityId>>[] {
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
  return targetIds.map(id => addProperty(msg, outKey, id));
}
