import { EntityManager } from 'rad-ecs';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { ActiveEffect, EffectOrigin, EffectTarget, TargetPos } from '../systems.types';
import { AreaResolver } from '../utils/area-resolver.util';
import { actionEffectOutput } from './action-effect-output.operator';
import { modifyEffectOutput } from './modify-effect-output.operator';
import { produceEffectOutput } from './produce-effect-output.operator';

export type EffectPipelineArgs = ActiveEffect &
  Partial<EffectTarget> &
  Partial<TargetPos> &
  EffectOrigin;

export function effectPipeline(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (EndType) => void
) {
  return <T extends EffectPipelineArgs>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((msg) => produceEffectOutput(msg, em)),
      mergeMap((msg) => modifyEffectOutput(msg, em)),
      mergeMap((msg) => actionEffectOutput(msg, em, areaResolver, ender))
    );
  };
}
