import { Id } from '@rad/rl-applib';
import * as Chance from 'chance';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { AttackOrder, MoveOrder, MovingEntity } from '../systems.types';
import { addProperty, radClone } from '../systems.utils';
import {
  gatherBumpInfo,
  GatherBumpInfoArgs,
  GatherBumpInfoOut,
} from './gather-bump-info.operator';
import { resolveBump, ResolveBumpOut } from './resolve-bump.operator';

type Args = GatherBumpInfoArgs & MovingEntity;
export type AssessBumpMoveArgs = Args;

type Out = GatherBumpInfoOut &
  ResolveBumpOut & { move: MoveOrder | null; attack: AttackOrder | null };
export type AssessBumpMoveOut = Out;

function assessBumpMoveStep<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Id<T & Out> {
  const gather = gatherBumpInfo(
    addProperty(msg, 'aggressorId', msg.movingId),
    em
  );
  const resolve = resolveBump(gather, em, rand);
  let move = null;
  let attack = null;
  if (resolve.newPosition) {
    move = { newPosition: resolve.newPosition, movingId: resolve.movingId };
  }
  if (resolve.combatTargetId) {
    attack = _.pick(resolve, [
      'combatTargetId',
      'aggressorId',
      'strikeSuccess',
      'woundSuccess',
      'damage',
      'damageTargetId',
    ]);
  }

  return { ...radClone(resolve), move, attack };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = assessBumpMoveStep;

export const assessBumpMove = typeCheck as typeof assessBumpMoveStep;
