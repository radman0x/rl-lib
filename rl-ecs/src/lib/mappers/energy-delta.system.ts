import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { isNullOrUndefined } from 'util';
import { EnergyCost } from '../components/energy-cost.model';
import { OperationStep } from '../operation-step.model';
import { CostPaid, EnergyDelta, EnergyDeltaDetails, Payer } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = Payer & Partial<CostPaid>;
export type EnergyDeltaArgs = Args;

type Out = EnergyDelta & CostPaid;
export type EnergyDeltaOut = Out;

function energyDeltaStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let energyDelta: EnergyDeltaDetails = null;
  let costPaid: boolean;
  costPaid = !isNullOrUndefined(msg.costPaid) ? msg.costPaid : null;

  if (isValidId(msg.payerId) && em.hasComponent(msg.payerId, EnergyCost)) {
    const cost = em.getComponent(msg.payerId, EnergyCost);
    energyDelta = { amount: -cost.amount };
    costPaid = false;
  }
  return { ...radClone(msg), energyDelta, costPaid };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = energyDeltaStep;

export const energyDelta = typeCheck as typeof energyDeltaStep;
