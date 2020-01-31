import { EntityManager, EntityId } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { GridPosData } from '../components/position.model';
import { radClone, hasSelectedPos } from './systems.utils';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SingleTarget } from '../components/single-target.model';

interface HookSingleTargetArgs {
  selectedPos?: GridPosData;
  effectId: EntityId;
}

export function hookSingleTarget<
  T extends { selectedPos?: GridPosData; effectId: EntityId }
>(
  source: Observable<T>,
  dest: Subject<SingleTargetOut & T>,
  em: EntityManager
) {
  source
    .pipe(
      filter(hasSelectedPos),
      filter(msg => em.hasComponent(msg.effectId, SingleTarget)),
      map(msg => targetedSingle(msg, em))
    )
    .subscribe(dest);
}

type Args = Required<HookSingleTargetArgs>;
export type SingleTargetArgs = Args;

interface Out {
  targetPos: GridPosData;
}
export type SingleTargetOut = Out;
function singleTargetStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  console.log(`SINGLE TARGET: pos: ${msg.selectedPos}`);
  return { ...radClone(msg), targetPos: msg.selectedPos };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = singleTargetStep;

export const targetedSingle = typeCheck as typeof singleTargetStep;
