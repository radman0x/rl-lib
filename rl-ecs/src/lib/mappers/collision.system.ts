import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import {
  ActiveEffect,
  AppliedForce,
  AppliedForceDetails,
  ChangeReport,
  EffectReport,
  EffectTarget,
} from '../systems.types';
import {
  isValidId,
  compassDirectionToUnitVector,
  addVec3,
} from '@rad/rl-utils';
import { GridPos } from '../components/position.model';
import { Physical, Size } from '../components/physical.model';

type Args = ActiveEffect &
  EffectTarget &
  Partial<EffectReport> &
  Partial<AppliedForce>;
export type CollisionArgs = Args;

type Out = EffectReport & AppliedForce;
export type CollisionOut = Out;

function collisionStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let effectReport: ChangeReport = msg.effectReport || null;
  let force: AppliedForceDetails = msg.force || null;

  if (
    msg.force &&
    isValidId(msg.effectTargetId) &&
    em.hasComponent(msg.effectTargetId, GridPos)
  ) {
    let gridPos = em.getComponent(msg.effectTargetId, GridPos);
    let changeBy = compassDirectionToUnitVector.get(msg.force.direction);
    let newPos = addVec3({ ...gridPos }, changeBy);

    let canOccupy = true;
    em.matchingIndex(new GridPos(newPos)).forEach((entity) => {
      if (
        entity.has(Physical) &&
        entity.component(Physical).size === Size.FILL
      ) {
        canOccupy = false;
      }
    });
    if (!canOccupy) {
      force = null;
      effectReport = {
        physics: {
          activeEffectDescription: 'motion is halted',
        },
      };
    }
  }
  return { ...radClone(msg), effectReport, force };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = collisionStep;

export const collision = typeCheck as typeof collisionStep;
