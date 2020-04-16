import { EntityManager, Entity } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import {
  entitiesAtPosition,
  EntitiesAtPositionArgs
} from './entities-at-position.system';
import { renameKey, radClone } from '../systems.utils';
import { CombatTargetEntity } from '../systems.types';
import { Martial } from '../components/martial.model';

type Args = EntitiesAtPositionArgs;
export type AcquireCombatTargetAtPositionArgs = Args;

type Out = CombatTargetEntity;
export type AcquireCombatTargetAtPositionOut = Out;

function acquireCombatTargetAtPositionStep<T extends Args>(
  msg: T,
  em: EntityManager,
  predicate?: (e: Entity) => boolean
): T & Out {
  const acquired = entitiesAtPosition(
    msg,
    em,
    candidate =>
      candidate.has(Martial) &&
      (!predicate || (predicate && predicate(candidate)))
  );
  if (acquired.length !== 0) {
    console.log(`COMBAT: target acquired: ${acquired[0].targetId}`);
    return { ...radClone(msg), combatTargetId: acquired[0].targetId };
  } else {
    console.log(`Combat target NOT acquired`);
    return { ...radClone(msg), combatTargetId: null };
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireCombatTargetAtPositionStep;

export const acquireCombatTargetAtPosition = typeCheck as typeof acquireCombatTargetAtPositionStep;
