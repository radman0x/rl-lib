import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Description } from '../components/description.model';
import { GridPos } from '../components/position.model';
import { Messages, MoveOrder } from '../systems.types';
import { radClone } from '../systems.utils';

type NoteworthyAtPosArgs = MoveOrder & Messages;

export function noteworthyAtPos(em: EntityManager) {
  return <T extends NoteworthyAtPosArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        const noteworthy = em
          .matchingIndex(new GridPos(msg.newPosition))
          .filter((e) => e.has(Description))
          .map((e) => e.component(Description))
          .map((desc) => `See here a ${desc.short}.`);
        return { ...radClone(msg), messages: [...msg.messages, ...noteworthy] };
      })
    );
  };
}
