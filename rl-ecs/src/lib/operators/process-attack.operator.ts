import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity } from '../mappers/integrity.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import { AttackOrder, WorldStateChangeReport } from '../systems.types';
import { attackMessage } from './attack-message.operator';

export type ProcessAttackArgs = { attack: AttackOrder | null };
export type ProcessAttackOut = WorldStateChangeReport;

export function processAttack(
  em: EntityManager,
  animator?: <T extends ProcessAttackArgs>(input: Observable<T>) => Observable<T>
) {
  return <T extends ProcessAttackArgs>(input: Observable<T>) =>
    input.pipe(
      animator ?? tap(() => {}),
      map((msg) => ({ ...msg, ...msg.attack })),
      map((msg) => integrity(msg, em)),
      map((msg) => markForDeath(msg, em)),
      attackMessage(em),
      map((msg) => grimReaper(msg, em))
    );
}
