import { EntityManager } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { GridPos, GridPosData } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { radClone } from './systems.utils';
import { EnteredPos } from './systems.types';

type Args = {
  protagId: EntityId;
  targetPos: GridPosData;
  canOccupy: true;
  canStand: true;
};
export type PlaceEntityAtArgs = Args;

type Out = EnteredPos;
export type PlaceEntityAtOut = Out;

function placeEntityAtStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  console.log(`MOVE: Moving entity ${msg.protagId} to ${msg.targetPos}`);
  em.setComponent(msg.protagId, new GridPos(msg.targetPos));
  return { ...radClone(msg), enteredPos: msg.targetPos };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = placeEntityAtStep;

export const placeEntityAt = typeCheck as typeof placeEntityAtStep;
