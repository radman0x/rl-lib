import { EntityManager, EntityId } from 'rad-ecs';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { teleport } from '../mappers/teleport.system';

export function produceEffectOutput(em: EntityManager) {
  return <T>(input: Observable<T & { effectId: EntityId }>) => {
    return merge(input.pipe(map(msg => teleport(msg, em))));
  };
}
