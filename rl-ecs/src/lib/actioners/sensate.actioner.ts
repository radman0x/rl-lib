import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import {
  EffectReport,
  EffectTarget,
  Stun,
  WorldStateChangeReport,
} from '../systems.types';
import { isValidId } from '@rad/rl-utils';

import { CountdownTimer } from '../components/coundown-timer.model';
import { RemoveSelf } from '../components/remove-self.model';
import { MemberOf } from '../components/member-of.model';
import { Description } from '../components/description.model';
import {
  Mental,
  MentalOverride,
  MentalState,
} from '../components/mental.model';
import { Modifier, AdjustType } from '../components/modifier.model';
import { StatusEffects } from '../components/status-effects.model';
import { Renderable } from '../components/renderable.model';

import * as _ from 'lodash';
import { PassiveEffect } from '../components/passive-effect.model';

type Args = Partial<EffectReport> &
  Partial<Stun> &
  EffectTarget &
  Partial<WorldStateChangeReport>;
export type SensateArgs = Args;

type Out = EffectReport;
export type SensateOut = Out;

function sensateStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let out = { ...radClone(msg) };
  if (
    msg.stun &&
    isValidId(msg.effectTargetId) &&
    em.hasComponent(msg.effectTargetId, Mental)
  ) {
    const statusEffects = new StatusEffects({
      contents: [
        em.create(
          new MentalOverride({ state: MentalState.STUNNED }),
          new PassiveEffect(),
          new CountdownTimer({
            max: msg.stun.duration,
            current: msg.stun.duration,
          }),
          new Renderable({
            image: '0004_yellow_overlay_16x16.png',
            zOrder: 10,
          }),
          new RemoveSelf({}),
          new MemberOf({
            component: StatusEffects,
            id: msg.effectTargetId,
            property: 'contents',
          })
        ).id,
      ],
    });
    em.setComponent(msg.effectTargetId, statusEffects);
    const effectTargetDesc = em.hasComponent(msg.effectTargetId, Description)
      ? em.getComponent(msg.effectTargetId, Description).short
      : 'Unnamed';
    _.set(
      out,
      'effectReport.sensate.worldStateChangeDescription',
      `${effectTargetDesc} is stunned!`
    );
  }
  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = sensateStep;

export const sensate = typeCheck as typeof sensateStep;
