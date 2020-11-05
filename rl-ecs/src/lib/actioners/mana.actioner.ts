import { Id } from '@rad/rl-applib';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { Charges } from '../components/charges.model';
import { Description } from '../components/description.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  EffectReport,
  EffectTarget,
  EnergyDelta,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';
import { findComponentInEntityChain } from '../utils/rad-ecs.utils';

type Args = EffectTarget &
  ActiveEffect &
  Partial<EnergyDelta> &
  Partial<EffectReport> &
  Partial<WorldStateChangeReport>;
export type ManaArgs = Args;

type Out = EffectReport;
export type ManaOut = Out;

function manaStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let out = { ...radClone(msg) };
  if (msg.energyDelta) {
    let chargesId = findComponentInEntityChain(em, msg.effectId, Charges);
    if (chargesId) {
      const currCharges = em.getComponent(chargesId, Charges);
      em.setComponent(
        chargesId,
        new Charges({
          ...currCharges,
          curr: currCharges.curr + msg.energyDelta.amount,
        })
      );
      const effectTargetDesc = em.hasComponent(msg.effectTargetId, Description)
        ? em.getComponent(msg.effectTargetId, Description).short
        : 'Unnamed';
      _.set(
        out,
        'effectReport.mana.worldStateChangeDescription',
        `${effectTargetDesc} energy changed!`
      );
    }
  }
  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = manaStep;

export const mana = typeCheck as typeof manaStep;
