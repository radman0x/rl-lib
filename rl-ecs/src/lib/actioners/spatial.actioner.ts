import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { GridPos, GridPosData } from '../components/position.model';
import { OperationStep } from '../operation-step.model';
import {
  EffectTarget,
  MovingEntity,
  NewPosition,
  SpatialReport,
  Teleported,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';

type Args = Partial<MovingEntity> &
  Partial<NewPosition> &
  Partial<Teleported> &
  Partial<EffectTarget> &
  Partial<WorldStateChangeReport>;
export type SpatialArgs = Args;

type Out = WorldStateChangeReport & SpatialReport;
export type SpatialOut = Out;

function spatialStep<T extends Args>(msg: T, em: EntityManager): Id<T & Out> {
  let worldStateChanged: boolean = msg.worldStateChanged || false;
  let worldStateChangeDescription: string =
    msg.worldStateChangeDescription || null;
  let spatialReport: { spatialId: EntityId; newPos: GridPosData } = null;

  if (msg.newPosition && isValidId(msg.movingId)) {
    em.setComponent(msg.movingId, new GridPos(msg.newPosition));
    return {
      ...radClone(msg),
      worldStateChanged: true,
      worldStateChangeDescription: 'You step into a new pos',
      spatialReport: { spatialId: msg.movingId, newPos: msg.newPosition },
    };
  }
  if (msg.teleport && isValidId(msg.effectTargetId)) {
    em.setComponent(
      msg.effectTargetId,
      new GridPos(msg.teleport.targetLocation)
    );

    worldStateChanged = true;
    worldStateChangeDescription = 'Materialise in a new pos';
    spatialReport = {
      spatialId: msg.effectTargetId,
      newPos: msg.teleport.targetLocation,
    };
  }

  return {
    ...radClone(msg),
    worldStateChanged,
    worldStateChangeDescription,
    spatialReport,
  };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = spatialStep;

export const spatial = typeCheck as typeof spatialStep;
