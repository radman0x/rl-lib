import { Id } from '@rad/rl-applib';
import { EntityManager } from 'rad-ecs';
import {
  resolveMeleeAttackDamage,
  ResolveMeleeAttackDamageOut,
} from '../mappers/resolve-melee-attack-damage.system';
import {
  resolveMove,
  ResolveMoveArgs,
  ResolveMoveOut,
} from '../mappers/resolve-move.system';
import {
  resolveStrike,
  ResolveStrikeArgs,
  ResolveStrikeOut,
} from '../mappers/resolve-strike.system';
import {
  resolveWound,
  ResolveWoundArgs,
  ResolveWoundOut,
} from '../mappers/resolve-wound.system';
import { OperationStep } from '../operation-step.model';

import * as Chance from 'chance';
import { resolveArmorSave } from '../mappers/resolve-armor-save.system';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

type Args = ResolveStrikeArgs & ResolveWoundArgs & ResolveMoveArgs;
export type ResolveBumpArgs = Args;

type Out = ResolveStrikeOut &
  ResolveWoundOut &
  ResolveMeleeAttackDamageOut &
  ResolveMoveOut;
export type ResolveBumpOut = Out;

export function resolveBump<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
) {
  return of(msg).pipe(
    map((msg) => resolveMove(msg)),
    map((msg) => resolveStrike(msg, em, rand)),
    map((msg) => resolveWound(msg, em, rand)),
    map((msg) => resolveArmorSave(msg, em, rand)),
    map((msg) => resolveMeleeAttackDamage(msg, em))
  );
}
