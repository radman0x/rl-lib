import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { EffectType, TargetEntity, Damaged } from './systems.types';
import { ColdResistance } from '../components/resistance.model';

type Args = Damaged & TargetEntity;
export type ColdResistArgs = Args;

interface Out {}
export type ColdResistOut = Out;

function coldResistStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  // const resist = em.getComponent(msg.targetId, ColdResistance);
  // const coldDamageIndex = msg.damages.findIndex(
  //   e => e.type === EffectType.COLD
  // );
  // const coldDamage = msg.damages[coldDamageIndex];
  // if (resist && resist.type === EffectType.COLD && coldDamage) {
  //   const finalDamage = coldDamage.amount - resist.factor;
  //   if (finalDamage <= 0) {
  //     const coldRemoved = msg.damages.splice(coldDamageIndex, 1);
  //     return { ...msg, damages: coldRemoved };
  //   } else {
  //     msg.damages[coldDamageIndex].amount = finalDamage;
  //   }
  // }
  return { ...msg };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = coldResistStep;

export const coldResist = typeCheck as typeof coldResistStep;
