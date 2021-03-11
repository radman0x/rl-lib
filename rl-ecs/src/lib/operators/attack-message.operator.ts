import { EntityId } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AttackOrder } from '../systems.types';
import { playerCombatString, radClone } from '../systems.utils';

export type AttackMessageArgs = {
  messages?: string[];
} & AttackOrder;

export function attackMessage(em: EntityManager) {
  return <T extends AttackMessageArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        let out: T & { messages?: string[] } = msg;
        if (msg.combatTargetId) {
          const message = playerCombatString(msg, em);
          const messages = msg.messages
            ? [...msg.messages, message]
            : [message];
          out = { ...radClone(msg), messages };
        }
        return out;
      })
    );
  };
}
