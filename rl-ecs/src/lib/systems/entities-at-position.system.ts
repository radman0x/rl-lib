import { Entity, EntityManager } from 'rad-ecs';
import { OperationStepMulti } from '../operation-step.model';
import { GridPos, GridPosData } from '../components/position.model';
import { EntityId } from '../ecs.types';
import * as cloneDeep from 'clone-deep';
import { Observable, Subject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DisplayOnly } from '../components/display-only.model';

export function hookEntitiesAtPosition<T extends EntitiesAtPositionArgs>(
  source: Observable<T>,
  dest: Subject<EntitiesAtPositionOut>,
  em: EntityManager
) {
  source
    .pipe(
      mergeMap(msg =>
        of(...entitiesAtPosition(msg, em, (e: Entity) => !e.has(DisplayOnly)))
      )
    )
    .subscribe(dest);
}

interface Args {
  targetPos: GridPosData;
}
export type EntitiesAtPositionArgs = Args;

interface Out {
  targetId: EntityId;
}
export type EntitiesAtPositionOut = Out;

type TargetPredicate = (entity: Entity) => boolean;

function entitiesAtPositionStep<T extends Args>(
  msg: T,
  em: EntityManager,
  predicate: TargetPredicate
): (T & Out)[] {
  const targetIds: EntityId[] = [];
  for (const candidate of em.matchingIndex(new GridPos(msg.targetPos))) {
    if (predicate(candidate)) {
      targetIds.push(candidate.id);
    }
  }

  if (targetIds.length === 0) {
    console.log(`TARGETING: No targets acquired`);
  } else {
    console.log(`TARGETING: targets acquired: [${targetIds.join(',')}]`);
  }
  return targetIds.map(id => ({ ...cloneDeep(msg), targetId: id }));
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = entitiesAtPositionStep;

export const entitiesAtPosition = typeCheck as typeof entitiesAtPositionStep;
