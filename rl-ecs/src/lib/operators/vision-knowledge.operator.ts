import { EntityId } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { mapTo, mergeMap, tap } from 'rxjs/operators';
import { addSeenToKnowledge } from '../actioners/add-seen-to-knowledge.actioner';
import { deprecateKnowledge } from '../actioners/deprecate-knowledge.actioner';
import { fovEntities } from '../mappers/fov-entities.system';
import { aggregateViewed } from './aggregate-viewed.operator';

export interface VisionKnowledgeArgs {
  sightedId: EntityId;
}

export function visionKnowledge(em: EntityManager) {
  return <T extends VisionKnowledgeArgs>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((msg) =>
        of(msg).pipe(
          tap(() => deprecateKnowledge({ knowledgeId: msg.sightedId }, em)),
          mergeMap((msg) => of(...fovEntities(msg, em))),
          aggregateViewed,
          tap((msg) => addSeenToKnowledge(msg, em)),
          mapTo(msg)
        )
      )
    );
  };
}
