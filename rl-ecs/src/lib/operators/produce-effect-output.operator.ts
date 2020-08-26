import { EntityManager } from 'rad-ecs';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { teleport } from '../mappers/teleport.system';
import { toggleLock } from '../mappers/toggle-lock.system';
import { ActiveEffect } from '../systems.types';
import { transitionArea } from '../mappers/transition-area.system';

/** Operator that parses an effect and has the appropriate data appear in the output.
 *
 * Produces N messages, one for each possible effect that could be present. This allows each effect to be processed
 * in its own event flow.
 */
export function produceEffectOutput(em: EntityManager) {
  return <T>(input: Observable<T & ActiveEffect>) => {
    return merge(
      input.pipe(map(msg => teleport(msg, em))),
      input.pipe(map(msg => toggleLock(msg, em))),
      input.pipe(map(msg => transitionArea(msg, em)))
    );
  };
}
