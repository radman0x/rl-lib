import { Id } from '@rad/rl-applib';
import { EntityManager } from 'rad-ecs';
import {
  acquireCombatTargetAtPosition,
  AcquireCombatTargetAtPositionArgs,
  AcquireCombatTargetAtPositionOut
} from '../mappers/acquire-combat-target-at-position.system';
import {
  canOccupyPosition,
  CanOccupyPositionArgs,
  CanOccupyPositionOut
} from '../mappers/can-occupy-position.system';
import {
  CanStandAtArgs,
  CanStandAtOut,
  canStandAtPosition
} from '../mappers/can-stand-at-position.system';
import {
  positionBlocked,
  PositionBlockedArgs,
  PositionBlockedOut
} from '../mappers/position-blocked.system';
import { OperationStep } from '../operation-step.model';

type Args = PositionBlockedArgs &
  CanOccupyPositionArgs &
  CanStandAtArgs &
  AcquireCombatTargetAtPositionArgs;
export type GatherBumpInfoArgs = Args;

type Out = PositionBlockedOut &
  CanOccupyPositionOut &
  CanStandAtOut &
  AcquireCombatTargetAtPositionOut;
export type GatherBumpInfoOut = Out;

function gatherBumpInfoStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  const blocked = positionBlocked(msg, em);
  const occupy = canOccupyPosition(blocked, em);
  const canStand = canStandAtPosition(occupy, em);
  const acquire = acquireCombatTargetAtPosition(canStand, em);
  return acquire;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = gatherBumpInfoStep;

export const gatherBumpInfo = typeCheck as typeof gatherBumpInfoStep;
