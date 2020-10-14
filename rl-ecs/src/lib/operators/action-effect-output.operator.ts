import { EntityManager } from 'rad-ecs';
import { BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { area, AreaArgs } from '../actioners/area.actioner';
import { lock, LockArgs } from '../actioners/lock.actioner';
import {
  removeEntity,
  RemoveEntityArgs,
} from '../actioners/remove-entity.actioner';
import { sensate } from '../actioners/sensate.actioner';
import { spatial, SpatialArgs } from '../actioners/spatial.actioner';
import { endState, EndStateArgs } from '../mappers/end-state.system';
import { EffectTarget } from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';

type Args = EffectTarget &
  SpatialArgs &
  LockArgs &
  AreaArgs &
  EndStateArgs &
  RemoveEntityArgs;
/** Operator that parses the input message for any effect data and then actions
 * the effect on the target entity in the message
 */
export function actionEffectOutput<T extends Args>(
  msg: T,
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (EndType) => void
) {
  return new BehaviorSubject(msg).pipe(
    take(1),
    map((msg) => spatial(msg, em)),
    map((msg) => lock(msg, em)),
    map((msg) => area(msg, em, areaResolver)),
    map((msg) => sensate(msg, em)),
    map((msg) => endState(msg, em, ender)),
    map((msg) => removeEntity(msg, em))
  );
}
