import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { DamageTargetEntity, Messages, ReapedEntity } from '../systems.types';
import { Wounds } from '../components/wounds.model';
import { RemoveEntityArgs } from '../actioners/remove-entity.actioner';
import { Description } from '../components/description.model';

type Args = DamageTargetEntity &
  Partial<ReapedEntity> &
  Partial<RemoveEntityArgs> &
  Partial<Messages>;
export type MarkForDeathArgs = Args;

type Out = ReapedEntity & RemoveEntityArgs & Messages;
export type MarkForDeathOut = Out;

function markForDeathStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  const out: T & Out = radClone({
    ...msg,
    reapedId: msg.reapedId ?? null,
    entityRemoval: msg.entityRemoval ?? null,
    messages: msg.messages ?? null,
  });
  if (!msg.damageTargetId) {
    return out;
  }
  if (!em.hasComponent(msg.damageTargetId, Wounds)) {
    return out;
  }
  const targetIntegrity = em.get(msg.damageTargetId).component(Wounds);
  if (targetIntegrity.current <= 0) {
    const targetDesc = em.getComponent(msg.damageTargetId, Description);
    out.messages = [
      ...(out.messages ?? []),
      `The ${targetDesc ? targetDesc.short : 'unnamed'} is killed!`,
    ];
    out.reapedId = em.get(msg.damageTargetId).id;
    out.entityRemoval = { doRemove: true, removeId: msg.damageTargetId };
  }
  return out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = markForDeathStep;

export const markForDeath = typeCheck as typeof markForDeathStep;
