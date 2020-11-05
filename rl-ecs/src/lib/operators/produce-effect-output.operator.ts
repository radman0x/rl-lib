import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { endGame } from '../mappers/end-game.system';
import { flagRemoveEntity } from '../mappers/flag-remove-entity.mapper';
import { force } from '../mappers/force.system.spec';
import { push } from '../mappers/push.system';
import { stun } from '../mappers/stun.system';
import { teleport } from '../mappers/teleport.system';
import { toggleLock } from '../mappers/toggle-lock.system';
import { transitionArea } from '../mappers/transition-area.system';
import {
  ActiveEffect,
  EffectOrigin,
  EffectTarget,
  TargetPos,
} from '../systems.types';

/** Operator that parses an effect and has the appropriate data appear in the output.
 */
export function produceEffectOutput<
  T extends ActiveEffect & EffectTarget & EffectOrigin & TargetPos
>(msg: T, em: EntityManager) {
  return of(msg).pipe(
    map((msg) => teleport(msg, em)),
    map((msg) => toggleLock(msg, em)),
    map((msg) => transitionArea(msg, em)),
    map((msg) => stun(msg, em)),
    map((msg) => push(msg, em)),
    map((msg) => force(msg, em)),
    map((msg) => endGame(msg, em)),
    map((msg) => flagRemoveEntity(msg, em))
  );
}
