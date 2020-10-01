import { EntityManager } from 'rad-ecs';
import { BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  magicResistance,
  MagicResistanceArgs,
} from '../mappers/effect-modifiers/magic-resistance.mapper';

/** Operator that parses target entity of an effect for resistances/modifiers
 *  and updates any effect data in the message as approriate.
 */
export function modifyEffectOutput<T extends MagicResistanceArgs>(
  msg: T,
  em: EntityManager
) {
  return new BehaviorSubject(msg).pipe(
    take(1),
    map((msg) => magicResistance(msg, em))
  );
}
