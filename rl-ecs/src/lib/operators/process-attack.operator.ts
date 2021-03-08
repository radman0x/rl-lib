import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity } from '../mappers/integrity.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import { AttackOrder, WorldStateChangeReport } from '../systems.types';

export type ProcessAttackArgs = { attack: AttackOrder | null };
export type ProcessAttackOut = WorldStateChangeReport;

export function processAttack(em: EntityManager) {
  return <T extends ProcessAttackArgs>(input: Observable<T>) =>
    input.pipe(
      map((msg) => ({ ...msg.attack })),
      map((msg) => integrity(msg, em)),
      map((msg) => markForDeath(msg, em)),
      map((msg) => grimReaper(msg, em))
    );
}
