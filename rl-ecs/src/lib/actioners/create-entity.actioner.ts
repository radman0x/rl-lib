import { CreateEntity, GridPos, TargetPos } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export type CreateEntityArgs = Partial<TargetPos> & { createEntity?: CreateEntity };

export function createEntity<T extends CreateEntityArgs>(em: EntityManager) {
  return (input: Observable<T>) => {
    return input.pipe(
      tap((msg) => {
        if (msg.createEntity && msg.targetPos) {
          if (msg.createEntity.replaceExisting) {
            em.matchingIndex(new GridPos(msg.targetPos)).forEach((entity) => em.remove(entity.id));
          }
          const components = em
            .get(msg.createEntity.entities[0]) // HACK, only using the first entity for now
            .allComponents()
            .map((entry) => entry.component);
          const id = em.create(...components).id;
          em.setComponent(id, new GridPos({ ...msg.targetPos }));
        }
      })
    );
  };
}
