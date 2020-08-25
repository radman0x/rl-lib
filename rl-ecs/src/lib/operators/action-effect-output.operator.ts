import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { lock } from '../actioners/lock.actioner';

/** Operator that parses the input message for any effect data and the actions
 * the effect on the target entity in the message
 */
export function actionEffectOutput(em: EntityManager) {
  return <T>(input: Observable<T & { effectTargetId: EntityId }>) => {
    return input.pipe(
      map(msg => spatial(msg, em)),
      map(msg => lock(msg, em))
    );
  };
}
