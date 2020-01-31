import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { Integrity } from '../components/physical.model';
import { EntityId } from '../ecs.types';
import { CalculateEffectDamageOut } from './calculate-effect-damage.system';
import { ResistEffectDamageOut } from './resist-effect-damage.system';

type Args = CalculateEffectDamageOut &
  ResistEffectDamageOut & { targetId: EntityId };
export type SustainDamageArgs = Args;

interface Out {}
export type SustainDamageOut = Out;

function sustainDamageStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const finalDamage =
    msg.damageSustained.amount - msg.damageResisted.resistedAmount;
  if (!em.hasComponent(msg.targetId, Integrity)) {
    return msg;
  }
  const currentDurability = em.get(msg.targetId).component(Integrity);
  em.setComponent(
    msg.targetId,
    new Integrity({
      current: currentDurability.current - finalDamage,
      max: currentDurability.max
    })
  );
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = sustainDamageStep;

export const sustainDamage = typeCheck as typeof sustainDamageStep;
