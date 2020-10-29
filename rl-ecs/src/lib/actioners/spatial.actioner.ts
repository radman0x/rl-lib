import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { GridPos, GridPosData } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import {
  EffectReport,
  EffectTarget,
  MovingEntity,
  NewPosition,
  SpatialReport,
  Teleported,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';

import * as _ from 'lodash';

type Args = Partial<MovingEntity> &
  Partial<NewPosition> &
  Partial<Teleported> &
  Partial<EffectTarget> &
  Partial<WorldStateChangeReport> &
  Partial<EffectReport>;
export type SpatialArgs = Args;

type Out = EffectReport & SpatialReport;
export type SpatialOut = Out;

function spatialStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let out = { ...radClone(msg), spatialReport: null };

  if (msg.newPosition && isValidId(msg.movingId)) {
    em.setComponent(msg.movingId, new GridPos(msg.newPosition));
    out.spatialReport = {
      spatialId: msg.movingId,
      newPos: msg.newPosition,
    };
    _.set(
      out,
      'effectReport.spatial.worldStateChangeDescription',
      'step into a new pos'
    );
  } else if (msg.teleport && isValidId(msg.effectTargetId)) {
    em.setComponent(
      msg.effectTargetId,
      new GridPos(msg.teleport.targetLocation)
    );

    out.spatialReport = {
      spatialId: msg.effectTargetId,
      newPos: msg.teleport.targetLocation,
    };
    _.set(
      out,
      'effectReport.spatial.worldStateChangeDescription',
      'materialize in a new pos'
    );
  }

  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = spatialStep;

export const spatial = typeCheck as typeof spatialStep;
