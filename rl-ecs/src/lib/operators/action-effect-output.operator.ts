import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { area, AreaArgs } from '../actioners/area.actioner';
import { endState, EndStateArgs } from '../actioners/end-state.actioner';
import { lock, LockArgs } from '../actioners/lock.actioner';
import { physics } from '../actioners/physics.actioner';
import {
  removeEntity,
  RemoveEntityArgs,
} from '../actioners/remove-entity.actioner';
import { sensate } from '../actioners/sensate.actioner';
import { spatial, SpatialArgs } from '../actioners/spatial.actioner';
import { integrity } from '../mappers/integrity.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import {
  ActiveEffect,
  Damaged,
  DamageTargetEntity,
  EffectTarget,
} from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';

type Args = EffectTarget &
  ActiveEffect &
  SpatialArgs &
  LockArgs &
  AreaArgs &
  EndStateArgs &
  RemoveEntityArgs &
  Damaged &
  DamageTargetEntity;
/** Operator that parses the input message for any effect data and then actions
 * the effect on the target entity in the message
 */
export function actionEffectOutput<T extends Args>(
  msg: T,
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (EndType) => void
) {
  return of(msg).pipe(
    map((msg) => spatial(msg, em)),
    map((msg) => lock(msg, em)),
    map((msg) => area(msg, em, areaResolver)),
    map((msg) => integrity(msg, em)),
    map((msg) => sensate(msg, em)),
    map((msg) => physics(msg, em)),
    map((msg) => endState(msg, em, ender)),
    map((msg) => markForDeath(msg, em)),
    map((msg) => removeEntity(msg, em))
  );
}
