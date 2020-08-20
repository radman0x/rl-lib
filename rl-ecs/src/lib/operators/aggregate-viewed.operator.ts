import { GridPos } from '../components/position.model';
import { EntityId } from 'rad-ecs';
import { Observable } from 'rxjs';
import { reduce } from 'rxjs/operators';
import { selSuggest, selAddToArray, Id } from '@rad/rl-applib';
import { SeenBreakdown } from '../actioners/add-seen-to-knowledge.actioner';

export interface Viewed {
  sightedId: EntityId;
  viewed: {
    atPos: GridPos;
    entityId: EntityId;
  };
}
export function aggregateViewed(input: Observable<Viewed>) {
  return input.pipe(
    reduce(
      (acc, curr) => {
        acc = acc || {};
        const entrySelector = `${curr.sightedId}.${curr.viewed.atPos.hash()}`;
        selSuggest(acc, entrySelector, {
          pos: curr.viewed.atPos,
          entityIds: []
        });
        selAddToArray(acc, `${entrySelector}.entityIds`, curr.viewed.entityId);
        return acc;
      },
      null as Id<SeenBreakdown>
    )
  );
}
