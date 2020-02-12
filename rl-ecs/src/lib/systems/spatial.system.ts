import { OperationStep } from '../operation-step.model';
import { EntityManager } from 'rad-ecs';
import { radClone } from '../systems.utils';
import { TeleportOut } from './teleport.system';
import { TargetEntity } from '../systems.types';
import { GridPos } from '../components/position.model';

type Args = Required<TeleportOut> & TargetEntity;
export type SpatialArgs = Args;

interface Out {}
export type SpatialOut = Out;

function spatialStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  console.log(
    `Spatial position of target: ${msg.targetId} updated: ${msg.teleport.targetLocation}`
  );
  em.setComponent(msg.targetId, new GridPos(msg.teleport.targetLocation));
  return { ...radClone(msg) };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = spatialStep;

export const spatial = typeCheck as typeof spatialStep;
