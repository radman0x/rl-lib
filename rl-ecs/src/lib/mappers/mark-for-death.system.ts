import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { DamageTargetEntity, ReapedEntity } from '../systems.types';
import { Wounds } from '../components/wounds.model';

type Args = DamageTargetEntity;
export type MarkForDeathArgs = Args;

type Out = ReapedEntity;
export type MarkForDeathOut = Out;

function markForDeathStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  const defaultRet = radClone({ ...msg, reapedId: null });
  if (msg.damageTargetId === null) {
    return defaultRet;
  }
  if (!em.hasComponent(msg.damageTargetId, Wounds)) {
    return defaultRet;
  }
  const targetIntegrity = em.get(msg.damageTargetId).component(Wounds);
  if (targetIntegrity.current <= 0) {
    const reapedId = em.get(msg.damageTargetId).id;
    console.log(`DEATH-MARK: Entity reaped: ${msg.damageTargetId}`);
    return { ...radClone(msg), reapedId };
  }
  return defaultRet;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = markForDeathStep;

export const markForDeath = typeCheck as typeof markForDeathStep;
