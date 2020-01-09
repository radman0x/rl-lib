import { OperationStep } from 'src/lib/operation-step.model';
import { EntityManager } from 'rad-ecs';
import { TargetPos, ActiveEffect } from './systems.types';

type Args = TargetPos & ActiveEffect;
export type AnimateEffectArgs = Args;

interface Out {}
export type AnimateEffectOut = Out;

function animateEffectStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  return { ...msg };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = animateEffectStep;

export const animateEffect = typeCheck as typeof animateEffectStep;
