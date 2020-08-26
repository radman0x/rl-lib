import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { ActiveEffect } from '../systems.types';
import { actionEffectOutput } from './action-effect-output.operator';
import { modifyEffectOutput } from './modify-effect-output.operator';
import { produceEffectOutput } from './produce-effect-output.operator';
import { AreaResolver } from '../utils/area-resolver.util';

export function effectPipeline(em: EntityManager, areaResolver: AreaResolver) {
  return <T>(input: Observable<T & ActiveEffect>) => {
    return input.pipe(
      produceEffectOutput(em),
      modifyEffectOutput(em),
      actionEffectOutput(em, areaResolver)
    );
  };
}
