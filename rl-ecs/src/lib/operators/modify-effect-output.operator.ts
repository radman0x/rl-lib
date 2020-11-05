import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { collision, CollisionArgs } from '../mappers/collision.system';
import {
  magicResistance,
  MagicResistanceArgs,
} from '../mappers/effect-modifiers/magic-resistance.mapper';

/** Operator that parses target entity of an effect for resistances/modifiers
 *  and updates any effect data in the message as approriate.
 */
export function modifyEffectOutput<
  T extends MagicResistanceArgs & CollisionArgs
>(msg: T, em: EntityManager) {
  return of(msg).pipe(
    map((msg) => magicResistance(msg, em)),
    map((msg) => collision(msg, em))
  );
}
