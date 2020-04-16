import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { Burn } from '../components/burn.model';
import { ActiveEffect, Damaged } from '../systems.types';
import * as cloneDeep from 'clone-deep';

type Args = ActiveEffect;
export type BurnArgs = Args;

type Out = Damaged;
export type BurnOut = Out;

function burnStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const d = em.getComponent(msg.effectId, Burn);
  if (d) {
    console.log(`BURN: Creating damage with amount: ${d.amount}`);
  }
  return d ? { ...cloneDeep(msg), damage: d } : msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = burnStep;

export const burn = typeCheck as typeof burnStep;
