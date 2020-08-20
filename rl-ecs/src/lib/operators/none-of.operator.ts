import { Observable } from 'rxjs';
import { filter, toArray } from 'rxjs/operators';

/** None of the events I receive match the predicate, then I'll produce an event, else none
 */
export function noneOf(predicate: (val: any) => boolean) {
  return <T>(input: Observable<T>) => {
    return input.pipe(
      filter(predicate),
      toArray(),
      filter(arr => arr.length === 0)
    );
  };
}
