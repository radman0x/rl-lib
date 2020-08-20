import { EntityManager } from 'rad-ecs';
import { GridPos, GridPosData } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import {
  EffectTarget,
  MovingEntity,
  NewPosition,
  Teleported,
  WorldStateChangeDescription
} from '../systems.types';
import { radClone, addProperty } from '../systems.utils';
import { Id } from '@rad/rl-applib';

import * as _ from 'lodash';

type Args = Partial<MovingEntity> &
  Partial<NewPosition> &
  Partial<Teleported> &
  Partial<EffectTarget>;
export type SpatialArgs = Args;

type Out = {
  worldStateChanged: boolean;
} & WorldStateChangeDescription;
export type SpatialOut = Out;

function spatialStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  if ((msg.newPosition && msg.movingId) || msg.movingId === 0) {
    console.log(
      `SPATIAL: position of target: ${msg.movingId} updated to ${msg.newPosition}`
    );
    em.setComponent(msg.movingId, new GridPos(msg.newPosition));
    return {
      ...radClone(msg),
      worldStateChanged: true,
      worldStateChangeDescription: 'You step into a new pos'
    };
  }
  if (msg.teleport && (msg.effectTargetId || msg.effectTargetId === 0)) {
    console.log(
      `SPATIAL: teleporting target: blah, to: ${msg.teleport.targetLocation}`
    );
    em.setComponent(
      msg.effectTargetId,
      new GridPos(msg.teleport.targetLocation)
    );

    return {
      ...radClone(msg),
      worldStateChanged: true,
      worldStateChangeDescription: 'Materialise in a new pos'
    };
  }

  return {
    ...radClone(msg),
    worldStateChanged: false,
    worldStateChangeDescription: null
  };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = spatialStep;

export const spatial = typeCheck as typeof spatialStep;
