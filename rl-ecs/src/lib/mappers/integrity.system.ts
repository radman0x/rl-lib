import { EntityManager } from 'rad-ecs';
import { Wounds } from '../components/wounds.model';
import { OperationStep } from '../operation-step.model';
import {
  Damaged,
  DamageTargetEntity,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';

type Args = Damaged & DamageTargetEntity;
export type IntegrityArgs = Args;

type Out = WorldStateChangeReport;
export type IntegrityOut = Out;

function integrityStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  if (!msg.damage) {
    return {
      ...radClone(msg),
      worldStateChanged: msg['worldStateChanged'] || false,
      worldStateChangeDescription: msg['worldStateChangeDescription'] || null,
    };
  }
  const targetWounds = em.getComponent(msg.damageTargetId, Wounds);
  if (targetWounds) {
    const finalWounds = targetWounds.current - msg.damage.amount;
    console.log(`Updating wounds to: ${finalWounds}`);
    em.setComponent(
      msg.damageTargetId,
      new Wounds({ max: targetWounds.max, current: finalWounds })
    );
    return {
      ...radClone(msg),
      worldStateChanged: true,
      worldStateChangeDescription: 'wound caused!',
    };
  } else {
    console.log(
      `INTEGRITY: target ${msg.damageTargetId} has no Wounds component and can't be damaged!`
    );
  }
  return {
    ...radClone(msg),
    worldStateChanged: msg['worldStateChanged'] || false,
    worldStateChangeDescription: msg['worldStateChangeDescription'] || null,
  };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = integrityStep;

export const integrity = typeCheck as typeof integrityStep;
