import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { Freeze } from '../components/freeze.model';
import { ActiveEffect, Damaged } from './systems.types';
import * as cloneDeep from 'clone-deep';

type Args = ActiveEffect;
export type FreezeArgs = Args;

type Out = Damaged;
export type FreezeOut = Out;

function freezeStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  const d = em.getComponent(msg.effectId, Freeze);
  return d ? { ...cloneDeep(msg), damage: d } : msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = freezeStep;

export const freeze = typeCheck as typeof freezeStep;
