import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { Integrity } from '../components/physical.model';
import {
  entitiesAtPosition,
  EntitiesAtPositionArgs
} from './entities-at-position.system';
import { renameKey } from '../systems.utils';
import { CombatTarget } from '../systems.types';
import { Martial } from '../components/martial.model';

type Args = EntitiesAtPositionArgs;
export type AcquireCombatTargetAtPositionArgs = Args;

type Out = Partial<CombatTarget>;
export type AcquireCombatTargetAtPositionOut = Out;

function acquireCombatTargetAtPositionStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const acquired = entitiesAtPosition(msg, em, candidate =>
    candidate.has(Martial)
  );
  if (acquired.length !== 0) {
    // console.log(`Combat target: ${JSON.stringify(acquired[0], null, 2)} was acquired`);
    return (renameKey(
      acquired[0],
      'targetId',
      'combatTargetId'
    ) as unknown) as T & Out;
  } else {
    console.log(`Combat target NOT acquired`);
    return msg;
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireCombatTargetAtPositionStep;

export const acquireCombatTargetAtPosition = typeCheck as typeof acquireCombatTargetAtPositionStep;
