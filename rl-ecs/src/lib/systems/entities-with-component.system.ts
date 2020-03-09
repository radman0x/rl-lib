import { ComponentConstructor, EntityManager } from 'rad-ecs';
import { Observable, of, Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { OperationStepMulti } from '../operation-step.model';
import { ProtagonistEntity } from '../systems.types';
import { radClone } from '../systems.utils';

export function hookEntitiesWithComponents<T>(
  source: Observable<T>,
  dest: Subject<EntitiesWithComponentOut & T>,
  em: EntityManager,
  ...componentTypes: ComponentConstructor[]
) {
  source
    .pipe(
      map(msg => ({ ...radClone(msg), componentTypes })),
      mergeMap(msg => of(...entitiesWithComponents(msg, em)))
    )
    .subscribe(dest);
}

interface Args {
  componentTypes: ComponentConstructor[];
}
export type EntitiesWithComponentArgs = Args;

type Out = ProtagonistEntity;
export type EntitiesWithComponentOut = Out;

function entitiesWithComponentsStep<T extends Args>(
  msg: T,
  em: EntityManager
): (T & Out)[] {
  return em
    .matching(...msg.componentTypes)
    .map(e => ({ ...radClone(msg), protagId: e.id }));
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = entitiesWithComponentsStep;

export const entitiesWithComponents = typeCheck as typeof entitiesWithComponentsStep;
