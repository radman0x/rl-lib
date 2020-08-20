import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  resolveMeleeAttackDamage,
  ResolveMeleeAttackDamageArgs
} from '../mappers/resolve-melee-attack-damage.system';
import { resolveMove, ResolveMoveArgs } from '../mappers/resolve-move.system';
import {
  resolveStrike,
  ResolveStrikeArgs
} from '../mappers/resolve-strike.system';
import {
  resolveWound,
  ResolveWoundArgs
} from '../mappers/resolve-wound.system';

export function resolveBump(em: EntityManager, rand: Chance.Chance) {
  return <T>(
    input: Observable<
      T &
        ResolveStrikeArgs &
        ResolveWoundArgs &
        ResolveMeleeAttackDamageArgs &
        ResolveMoveArgs
    >
  ) => {
    return input.pipe(
      map(msg => resolveStrike(msg, em, rand)),
      map(msg => resolveWound(msg, em, rand)),
      map(msg => resolveMeleeAttackDamage(msg, em)),
      map(msg => resolveMove(msg))
    );
  };
}
