import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { magicResistance } from '../mappers/effect-modifiers/magic-resistance.mapper';

/** Operator that parses target entity of an effect for resistances/modifiers
 *  and updates any effect data in the message as approriate.
 */
export function modifyEffectOutput(em: EntityManager) {
  return <T>(input: Observable<T & { effectTargetId: EntityId }>) => {
    return input.pipe(map(msg => magicResistance(msg, em)));
  };
}
