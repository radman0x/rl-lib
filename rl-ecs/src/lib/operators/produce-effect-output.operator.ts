import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, merge } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { endGame } from '../mappers/end-game.system';
import { flagRemoveEntity } from '../mappers/flag-remove-entity.mapper';
import { stun } from '../mappers/stun.system';
import { teleport } from '../mappers/teleport.system';
import { toggleLock } from '../mappers/toggle-lock.system';
import { transitionArea } from '../mappers/transition-area.system';
import { ActiveEffect, EffectTarget } from '../systems.types';

/** Operator that parses an effect and has the appropriate data appear in the output.
 *
 * Produces N messages, one for each possible effect that could be present. This allows each effect to be processed
 * in its own event flow.
 */
export function produceEffectOutput<T extends ActiveEffect & EffectTarget>(
  msg: T,
  em: EntityManager
) {
  const start$ = new BehaviorSubject(msg);
  const test = merge(
    start$.pipe(
      take(1),
      map((msg) => teleport(msg, em))
    ),
    start$.pipe(
      take(1),
      map((msg) => toggleLock(msg, em))
    ),
    start$.pipe(
      take(1),
      map((msg) => transitionArea(msg, em))
    ),
    start$.pipe(
      take(1),
      map((msg) => stun(msg, em))
    ),
    start$.pipe(
      take(1),
      map((msg) => endGame(msg, em))
    ),
    start$.pipe(
      take(1),
      map((msg) => flagRemoveEntity(msg, em))
    )
  );
  return test;
}
