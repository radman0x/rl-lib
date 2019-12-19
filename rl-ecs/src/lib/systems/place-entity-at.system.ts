import { EntityManager } from 'rad-ecs';
import { OperationStep } from 'src/lib/operation-step.model';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { CanOccupyPositionOut } from './can-occupy-position.system';
import { CanStandAtOut } from './can-stand-at-position.system';

type Args = {
  protagId: EntityId;
  targetPos: GridPos;
} & CanStandAtOut &
  CanOccupyPositionOut;
export type PlaceEntityAtArgs = Args;

interface Out {}
export type PlaceEntityAtOut = Out;

function placeEntityAtStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  if (msg.canOccupy && msg.canStand) {
    console.log(`MOVE: Moving entity ${msg.protagId} to ${msg.targetPos}`);
    em.setComponent(msg.protagId, msg.targetPos);
  } else {
    console.log(
      `Unable to place entity at: ${msg.targetPos}, canStand: ${msg.canStand}, canOccupy: ${msg.canOccupy}`
    );
  }

  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = placeEntityAtStep;

export const placeEntityAt = typeCheck as typeof placeEntityAtStep;
