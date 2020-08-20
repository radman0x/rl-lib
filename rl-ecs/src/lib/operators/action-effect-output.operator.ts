import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';

export function actionEffectOutput(em: EntityManager) {
  return <T>(input: Observable<T & { effectTargetId: EntityId }>) => {
    return input.pipe(map(msg => spatial(msg, em)));
  };
}
