import { EntityManager, EntityId } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { ValueMap } from '@rad/rl-utils';
import { Knowledge } from '../components/knowledge.model';
import { Id } from '@rad/rl-applib';

export interface SeenBreakdown {
  [sightedId: number]: {
    [pos: string]: {
      pos: GridPos;
      entityIds: EntityId[];
    };
  };
}

export function addSeenToKnowledge(
  em: EntityManager,
  breakdown: Id<SeenBreakdown> | null
) {
  if (breakdown !== null) {
    for (const [stringId, posEntry] of Object.entries(breakdown)) {
      const newSeen = new ValueMap<GridPos, EntityId[]>();
      for (const { pos, entityIds } of Object.values(posEntry)) {
        newSeen.set(pos, entityIds);
      }
      const sightedId = Number(stringId);
      const knowledge = em.getComponent(sightedId, Knowledge);
      em.setComponent(
        sightedId,
        new Knowledge({
          current: newSeen,
          history: knowledge.history
        })
      );
    }
  }
}
