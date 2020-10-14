import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { EffectTarget, Stun, WorldStateChangeReport } from '../systems.types';
import { isValidId } from '@rad/rl-utils';
import { Mental, MentalState } from '../components/mental.model';

type Args = Partial<Stun> & EffectTarget & Partial<WorldStateChangeReport>;
export type SensateArgs = Args;

type Out = WorldStateChangeReport;
export type SensateOut = Out;

function sensateStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let worldStateChanged: boolean = msg.worldStateChanged || false;
  let worldStateChangeDescription: string =
    msg.worldStateChangeDescription || null;
  if (
    msg.stun &&
    isValidId(msg.effectTargetId) &&
    em.hasComponent(msg.effectTargetId, Mental)
  ) {
    em.setComponent(
      msg.effectTargetId,
      new Mental({ state: MentalState.STUNNED })
    );
    worldStateChanged = true;
    worldStateChangeDescription = 'Someone got stunned!!';
  }
  return { ...radClone(msg), worldStateChanged, worldStateChangeDescription };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = sensateStep;

export const sensate = typeCheck as typeof sensateStep;
