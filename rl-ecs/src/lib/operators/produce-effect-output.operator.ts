import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, merge } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { endGame } from '../mappers/end-game.system';
import { flagRemoveEntity } from '../mappers/flag-remove-entity.mapper';
import { push } from '../mappers/push.system';
import { stun } from '../mappers/stun.system';
import { teleport } from '../mappers/teleport.system';
import { toggleLock } from '../mappers/toggle-lock.system';
import { transitionArea } from '../mappers/transition-area.system';
import { ActiveEffect, EffectTarget } from '../systems.types';

/** Operator that parses an effect and has the appropriate data appear in the output.
 */
export function produceEffectOutput<T extends ActiveEffect & EffectTarget>(
  msg: T,
  em: EntityManager
) {
  return new BehaviorSubject(msg).pipe(
    take(1),
    map((msg) => teleport(msg, em)),
    map((msg) => toggleLock(msg, em)),
    map((msg) => transitionArea(msg, em)),
    map((msg) => stun(msg, em)),
    map((msg) => push(msg, em)),
    map((msg) => endGame(msg, em)),
    map((msg) => flagRemoveEntity(msg, em))
  );
}
