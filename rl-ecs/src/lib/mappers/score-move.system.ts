import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MoveOrder } from '../systems.types';
import { radClone } from '../systems.utils';

export interface ScoreMoveArgs {
  score: number | null;
  move: MoveOrder | null;
}

export function scoreMove(em: EntityManager) {
  return <T extends ScoreMoveArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        let score = msg.score ?? null;
        if (msg.move) {
          score = score ?? 0;
        }
        return { ...radClone(msg), score };
      })
    );
  };
}
