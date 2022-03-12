import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Consumable } from '../components/consumable.model';
import { EntityRemoval, EntityRemovalDetails, ProcessConsequence } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ProcessConsequence & Partial<EntityRemoval>;
export function consequencePipeline<T extends Args>(msg: T, em: EntityManager) {
  return of(msg).pipe(
    map((msg) => {
      let entityRemoval: EntityRemovalDetails = msg.entityRemoval || null;
      if (isValidId(msg.consequenceId) && em.exists(msg.consequenceId)) {
        if (isValidId(msg.consequenceId) && em.hasComponent(msg.consequenceId, Consumable)) {
          const test = em.getComponent(msg.consequenceId, Consumable);
          const again = em.get(msg.consequenceId);
          if (em.getComponent(msg.consequenceId, Consumable).uses <= 0) {
            entityRemoval = { removeId: msg.consequenceId, doRemove: true };
          }
        }
      }
      return radClone({ ...msg, entityRemoval });
    })
  );
}
