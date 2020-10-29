import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Description } from '../components/description.model';
import { GridPosData } from '../components/position.model';
import { Teleport } from '../components/teleport.model';
import { OperationStep } from '../operation-step.model';
import {
  ActiveEffect,
  ChangeReport,
  EffectReport,
  TeleportDetails,
  Teleported,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = ActiveEffect & Partial<EffectReport>;
export type TeleportArgs = Args;

type Out = Partial<Teleported> & EffectReport;
export type TeleportOut = Out;

function teleportStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let effectReport: ChangeReport = msg.effectReport || null;
  let teleport: TeleportDetails = null;
  if (isValidId(msg.effectId)) {
    const t = em.getComponent(msg.effectId, Teleport);
    if (t) {
      console.log(`Actioning teleport to: ${JSON.stringify(t.target)}`);
      const activeEffectDescription = em.hasComponent(msg.effectId, Description)
        ? em.getComponent(msg.effectId, Description).short
        : 'Some effect';
      effectReport = {
        spatial: {
          activeEffectDescription,
        },
      };
      teleport = { targetLocation: t.target };
    }
  }
  return { ...radClone(msg), teleport, effectReport };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = teleportStep;

export const teleport = typeCheck as typeof teleportStep;
