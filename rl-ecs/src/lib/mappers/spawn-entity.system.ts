import {
  ActiveEffect,
  ChangeReport,
  CreateEntity,
  EffectReport,
  EffectTarget,
  radClone,
} from '@rad/rl-ecs';
import { isValidId } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpawnEntity } from '../components/spawn-entity';

export type SpawnEntityArgs = ActiveEffect & Partial<EffectTarget> & Partial<EffectReport>;

export function spawnEntity<T extends SpawnEntityArgs>(em: EntityManager) {
  return (input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        let effectReport: ChangeReport = msg.effectReport || null;
        let createEntity: CreateEntity = null;
        if (em.hasComponent(msg.effectId, SpawnEntity) && !isValidId(msg.effectTargetId)) {
          const spawn = em.getComponent(msg.effectId, SpawnEntity);
          createEntity = {
            entities: spawn.entities,
            replaceExisting: spawn.replaceExisting ?? false,
          };
        }
        return { ...radClone(msg), createEntity, effectReport };
      })
    );
  };
}
