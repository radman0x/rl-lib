import { Id } from '@rad/rl-applib';
import { EntityManager } from 'rad-ecs';
import {
  resolveMeleeAttackDamage,
  ResolveMeleeAttackDamageOut
} from '../mappers/resolve-melee-attack-damage.system';
import {
  resolveMove,
  ResolveMoveArgs,
  ResolveMoveOut
} from '../mappers/resolve-move.system';
import {
  resolveStrike,
  ResolveStrikeArgs,
  ResolveStrikeOut
} from '../mappers/resolve-strike.system';
import {
  resolveWound,
  ResolveWoundArgs,
  ResolveWoundOut
} from '../mappers/resolve-wound.system';
import { OperationStep } from '../operation-step.model';

type Args = ResolveStrikeArgs & ResolveWoundArgs & ResolveMoveArgs;
export type ResolveBumpArgs = Args;

type Out = ResolveStrikeOut &
  ResolveWoundOut &
  ResolveMeleeAttackDamageOut &
  ResolveMoveOut;
export type ResolveBumpOut = Out;

function resolveBumpStep<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Id<T & Out> {
  return resolveMove(
    resolveMeleeAttackDamage(
      resolveWound(resolveStrike(msg, em, rand), em, rand),
      em
    )
  );
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveBumpStep;

export const resolveBump = typeCheck as typeof resolveBumpStep;
