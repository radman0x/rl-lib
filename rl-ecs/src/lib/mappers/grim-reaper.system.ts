import { Id } from '@rad/rl-applib';
import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { ReapedEntity } from '../systems.types';

type Args = ReapedEntity;
export type GrimReaperArgs = Args;

interface Out {}
export type GrimReaperOut = Out;

function grimReaperStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T> & Out {
  if (msg.reapedId !== null || msg.reapedId !== undefined) {
    em.remove(msg.reapedId);
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = grimReaperStep;

export const grimReaper = typeCheck as typeof grimReaperStep;
