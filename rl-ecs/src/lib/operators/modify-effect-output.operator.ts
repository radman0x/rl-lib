import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { magicResistance } from '../mappers/effect-modifiers/magic-resistance.mapper';

export function modifyEffectOutput(em: EntityManager) {
  return <T>(input: Observable<T & { effectTargetId: EntityId }>) => {
    return input.pipe(map(msg => magicResistance(msg, em)));
  };
}
