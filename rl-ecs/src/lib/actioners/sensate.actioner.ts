import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { EffectTarget, Stun, WorldStateChangeReport } from '../systems.types';
import { isValidId } from '@rad/rl-utils';

import { CountdownTimer } from '../components/coundown-timer.model';
import { RemoveSelf } from '../components/remove-self.model';
import { MemberOf } from '../components/member-of.model';
import { Description } from '../components/description.model';
import { Mental, MentalState } from '../components/mental.model';
import { Modifier, AdjustType } from '../components/modifier.model';
import { StatusEffects } from '../components/status-effects.model';

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
    const statusEffects = new StatusEffects({
      list: [
        em.create(
          new Modifier({
            entries: [
              {
                type: Mental,
                property: 'state',
                adjustType: AdjustType.REPLACE,
                adjustValue: MentalState.STUNNED,
              },
            ],
          }),
          new CountdownTimer({
            max: msg.stun.duration,
            current: msg.stun.duration,
          }),
          new RemoveSelf({}),
          new MemberOf({
            component: StatusEffects,
            id: msg.effectTargetId,
            property: 'list',
          })
        ).id,
      ],
    });
    em.setComponent(msg.effectTargetId, statusEffects);
    const effectTargetDesc = em.hasComponent(msg.effectTargetId, Description)
      ? em.getComponent(msg.effectTargetId, Description).short
      : 'Unnamed';
    worldStateChanged = true;
    worldStateChangeDescription = `${effectTargetDesc} is stunned!`;
  }
  return { ...radClone(msg), worldStateChanged, worldStateChangeDescription };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = sensateStep;

export const sensate = typeCheck as typeof sensateStep;