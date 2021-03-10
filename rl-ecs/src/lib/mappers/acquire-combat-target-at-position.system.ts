import { Id } from '@rad/rl-applib';
import { Entity, EntityManager } from 'rad-ecs';
import { WeaponSkill } from '../components/weapon-skill.model';
import { OperationStep } from '../operation-step.model';
import { CombatTargetEntity } from '../systems.types';
import { radClone } from '../systems.utils';
import {
  entitiesAtPosition,
  EntitiesAtPositionArgs,
} from './entities-at-position.system';

type Args = EntitiesAtPositionArgs;
export type AcquireCombatTargetAtPositionArgs = Args;

type Out = CombatTargetEntity;
export type AcquireCombatTargetAtPositionOut = Out;

function acquireCombatTargetAtPositionStep<T extends Args>(
  msg: T,
  em: EntityManager,
  predicate?: (e: Entity) => boolean
): Id<T & Out> {
  const acquired = entitiesAtPosition(
    msg,
    em,
    'targetId',
    (candidate) =>
      candidate.has(WeaponSkill) &&
      (!predicate || (predicate && predicate(candidate)))
  );
  if (acquired.length !== 0 && acquired[0].targetId !== null) {
    // console.log(`COMBAT: target acquired: ${acquired[0].targetId}`);
    return { ...radClone(msg), combatTargetId: acquired[0].targetId };
  } else {
    // console.log(`Combat target NOT acquired`);
    return { ...radClone(msg), combatTargetId: null };
  }
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = acquireCombatTargetAtPositionStep;

export const acquireCombatTargetAtPosition = typeCheck as typeof acquireCombatTargetAtPositionStep;
