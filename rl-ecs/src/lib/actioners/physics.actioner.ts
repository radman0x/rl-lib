import { Id, selAddToArray, selSuggest } from '@rad/rl-applib';
import {
  addVec3,
  compassDirectionToUnitVector,
  equalsVec3,
  isValidId,
} from '@rad/rl-utils';
import * as _ from 'lodash';
import { EntityManager } from 'rad-ecs';
import { Description } from '../components/description.model';
import { Force } from '../components/force.model';
import { Mental } from '../components/mental.model';
import { GridPos } from '../components/position.model';
import { Teleport } from '../components/teleport.model';
import { OperationStep } from '../operation-step.model';
import {
  AppliedForce,
  EffectReport,
  EffectTarget,
  SpawnedEffect,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = Partial<EffectReport> &
  Partial<AppliedForce> &
  EffectTarget &
  Partial<WorldStateChangeReport>;
export type PhysicsArgs = Args;

type Out = EffectReport;
export type PhysicsOut = Out;

function physicsStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let out = { ...radClone(msg) };
  if (
    msg.force &&
    isValidId(msg.effectTargetId) &&
    em.hasComponent(msg.effectTargetId, GridPos)
  ) {
    let gridPos = em.getComponent(msg.effectTargetId, GridPos);
    let newPos = { ...gridPos };
    let changeBy = compassDirectionToUnitVector.get(msg.force.direction);

    if (msg.force.magnitude > 0) {
      selSuggest(out, 'effectReport.physics.spawnedEffects', []);
      selAddToArray(out, 'effectReport.physics.spawnedEffects', {
        effectId: em.create(new Teleport({ target: addVec3(newPos, changeBy) }))
          .id,
        effectTargetId: msg.effectTargetId,
      });
      selAddToArray(out, 'effectReport.physics.spawnedEffects', {
        effectId: em.create(
          new Force({
            magnitude: msg.force.magnitude - 1,
            direction: msg.force.direction,
          })
        ).id,
        effectTargetId: msg.effectTargetId,
      });
    }

    const effectTargetDesc = em.hasComponent(msg.effectTargetId, Description)
      ? em.getComponent(msg.effectTargetId, Description).short
      : 'Unnamed';
    _.set(
      out,
      'effectReport.physics.worldStateChangeDescription',
      `${effectTargetDesc} is struck!`
    );
  }
  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = physicsStep;

export const physics = typeCheck as typeof physicsStep;
