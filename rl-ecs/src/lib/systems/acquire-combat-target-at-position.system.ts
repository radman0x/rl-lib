import { EntityManager } from 'rad-ecs';
import { OperationStep } from 'src/lib/operation-step.model';
import { Durability } from '../components/physical.model';
import { EntityId } from '../ecs.types';
import {
  acquireTargetAtPosition,
  AcquireTargetAtPositionArgs
} from './acquire-target-at-position.system';
import { renameKey } from './system.utils';

type Args = AcquireTargetAtPositionArgs;
export type AcquireCombatTargetAtPositionArgs = Args;

interface Out {
  combatTargetId: EntityId | undefined;
}
export type AcquireCombatTargetAtPositionOut = Out;

function acquireCombatTargetAtPositionStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const acquired = acquireTargetAtPosition(msg, em, candidate =>
    candidate.has(Durability)
  );
  if (acquired.length !== 0) {
    return (renameKey(
      acquired[0],
      'targetId',
      'combatTargetId'
    ) as unknown) as (T & Out);
  } else {
    return { ...msg, combatTargetId: undefined };
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireCombatTargetAtPositionStep;

export const acquireCombatTargetAtPosition = typeCheck as typeof acquireCombatTargetAtPositionStep;
