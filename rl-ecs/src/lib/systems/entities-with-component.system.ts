import { ComponentConstructor, EntityManager } from 'rad-ecs';
import { Observable, of, Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { OperationStepMulti } from '../operation-step.model';
import { ProtagonistEntity } from '../systems.types';
import { radClone } from '../systems.utils';

export function hookEntitiesWithComponent<T>(
  source: Observable<T>,
  dest: Subject<EntitiesWithComponentOut & T>,
  em: EntityManager,
  componentType: ComponentConstructor
) {
  source
    .pipe(
      map(msg => ({ ...radClone(msg), componentType })),
      mergeMap(msg => of(...entitiesWithComponent(msg, em)))
    )
    .subscribe(dest);
}

interface Args {
  componentType: ComponentConstructor;
}
export type EntitiesWithComponentArgs = Args;

type Out = ProtagonistEntity;
export type EntitiesWithComponentOut = Out;

function entitiesWithComponentStep<T extends Args>(
  msg: T,
  em: EntityManager
): (T & Out)[] {
  return em.matching(msg.componentType).map(e => ({ ...msg, protagId: e.id }));
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = entitiesWithComponentStep;

export const entitiesWithComponent = typeCheck as typeof entitiesWithComponentStep;
