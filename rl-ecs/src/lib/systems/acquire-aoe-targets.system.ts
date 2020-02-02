import { EntityId, EntityManager } from 'rad-ecs';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { OperationStepMulti } from '../operation-step.model';
import {
  AreaOfEffect,
  AreaOfEffectData
} from '../components/area-of-effect.model';
import { GridPos, GridPosData } from '../components/position.model';
import {
  hasSelectedPos,
  positionsWithinRadius,
  radClone
} from './systems.utils';

export interface HookAoeTargetArgs {
  selectedPos?: GridPosData;
  effectId: EntityId;
}

export function hookAoeTarget<T extends HookAoeTargetArgs>(
  source: Observable<T>,
  dest: Subject<AcquireAoeTargetsOut & T>,
  em: EntityManager
) {
  source
    .pipe(
      filter(hasSelectedPos),
      filter(msg => em.hasComponent(msg.effectId, AreaOfEffect)),
      map(msg => ({
        ...radClone(msg),
        areaOfEffect: radClone(em.getComponent(msg.effectId, AreaOfEffect)!)
      })),
      mergeMap(msg => of(...acquireAoePositions(msg)))
    )
    .subscribe(dest);
}

interface Args {
  selectedPos: GridPosData;
  areaOfEffect: AreaOfEffectData;
}
export type AcquireAOETargetsArgs = Args;

interface Out {
  targetPos: GridPosData;
}
export type AcquireAoeTargetsOut = Out;

function acquireAoePositionsStep<T extends Args>(msg: T): (T & Out)[] {
  if (!msg.areaOfEffect) {
    throw Error(`AOE params not provided!`);
  }
  const targetPositions = positionsWithinRadius(
    new GridPos(msg.selectedPos),
    msg.areaOfEffect.radius
  );
  if (targetPositions.length === 0) {
    console.log(
      `AOE: No target positions found for radius: ${msg.areaOfEffect.radius} and target: ${msg.selectedPos}`
    );
  } else {
    console.log(`AOE: Target positions found: ${targetPositions.length}}`);
  }
  return targetPositions.map(p => ({
    ...radClone(msg),
    targetPos: p
  }));
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = acquireAoePositionsStep;

export const acquireAoePositions = typeCheck as typeof acquireAoePositionsStep;
