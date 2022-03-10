import { EntityManager } from 'rad-ecs';
import { Wounds } from '../components/wounds.model';
import { OperationStep } from '../operation-step.model';
import {
  Damaged,
  DamageTargetEntity,
  EffectReport,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { Description } from '../components/description.model';

import * as _ from 'lodash';

type Args = Damaged & DamageTargetEntity;
export type IntegrityArgs = Args;

type Out = EffectReport;
export type IntegrityOut = Out;

function integrityStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let out = { ...radClone(msg) };
  if (msg.damage && isValidId(msg.damageTargetId)) {
    const targetWounds = em.getComponent(msg.damageTargetId, Wounds);
    if (targetWounds) {
      const finalWounds = Math.min(targetWounds.current - msg.damage.amount, targetWounds.max);
      // console.log(`Updating wounds to: ${finalWounds}`);
      em.setComponent(msg.damageTargetId, new Wounds({ ...targetWounds, current: finalWounds }));
    }
    const effectTargetDesc = em.hasComponent(msg.damageTargetId, Description)
      ? em.getComponent(msg.damageTargetId, Description).short
      : 'Unnamed';
    _.set(
      out,
      'effectReport.sensate.worldStateChangeDescription',
      `${effectTargetDesc} is ${msg.damage.amount > 0 ? 'hurt' : 'healed'}!`
    );
  }
  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = integrityStep;

export const integrity = typeCheck as typeof integrityStep;
