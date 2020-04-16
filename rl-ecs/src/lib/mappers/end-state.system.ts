import { EntityManager, EntityId } from 'rad-ecs';
import { EndType, EndState } from '../components/end-state.model';
import { OperationStep } from '../operation-step.model';
import { radClone } from '../systems.utils';

interface Args {
  effectId: EntityId;
}
export type EndStateArgs = Args;

interface Out {}
export type EndStateOut = Out;

function endStateStep<T extends Args>(
  msg: T,
  em: EntityManager,
  ender: (et: EndType) => void
): T & Out {
  const endEffect = em.getComponent(msg.effectId, EndState);
  if (endEffect) {
    console.log(`ENDING!`);
    ender(endEffect.endType);
  }
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = endStateStep;

export const endState = typeCheck as typeof endStateStep;
