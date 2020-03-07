import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import {
  ProtagonistEntity,
  CombatTarget,
  WoundsInflicted
} from '../systems.types';
import { Attacks } from '../components/attacks.model';

type Args = ProtagonistEntity & CombatTarget;
export type ResolveMeleeAttackDamageArgs = Args;

type Out = WoundsInflicted;
export type ResolveMeleeAttackDamageOut = Out;

function resolveMeleeAttackDamageStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const woundsInflicted = em.getComponent(msg.protagId, Attacks).damage;

  return { ...radClone(msg), woundsInflicted };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveMeleeAttackDamageStep;

export const resolveMeleeAttackDamage = typeCheck as typeof resolveMeleeAttackDamageStep;
