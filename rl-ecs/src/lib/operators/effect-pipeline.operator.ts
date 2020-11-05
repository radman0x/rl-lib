import { EntityManager } from 'rad-ecs';
import { BehaviorSubject } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import {
  ActiveEffect,
  EffectOrigin,
  EffectTarget,
  TargetPos,
} from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';
import { actionEffectOutput } from './action-effect-output.operator';
import { modifyEffectOutput } from './modify-effect-output.operator';
import { produceEffectOutput } from './produce-effect-output.operator';

export function effectPipeline<
  T extends ActiveEffect & EffectTarget & TargetPos & EffectOrigin
>(
  msg: T,
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (EndType) => void
) {
  return new BehaviorSubject(msg).pipe(
    take(1),
    mergeMap((msg) => produceEffectOutput(msg, em)),
    mergeMap((msg) => modifyEffectOutput(msg, em)),
    mergeMap((msg) => actionEffectOutput(msg, em, areaResolver, ender))
  );
}
