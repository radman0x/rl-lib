import { Id } from '@rad/rl-applib';
import * as deepEqual from 'fast-deep-equal';
import { EntityManager } from 'rad-ecs';
import { Physical, Size } from '../components/physical.model';
import { GridPos, GridPosData } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { OperationStep } from '../operation-step.model';
import { addProperty } from '../systems.utils';
import { TargetPos } from '../systems.types';

export type CanStandAtArgs = TargetPos;

interface Out {
  canStand: boolean | null;
}
export type CanStandAtOut = Out;

function canStandAtPositionStep<T extends CanStandAtArgs>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  if (msg.targetPos === null) {
    return addProperty(msg, 'canStand', null);
  }
  let canStand = false;
  em.matchingIndex(
    new GridPos({ ...msg.targetPos, z: msg.targetPos.z - 1 })
  ).forEach((entity) => {
    if (entity.has(Physical) && entity.component(Physical).size === Size.FILL) {
      canStand = true;
    }
  });

  // console.log(
  //   `STAND: Pos ${msg.targetPos.toString()} ${
  //     canStand ? `can` : `CANNOT`
  //   } be stood on`
  // );
  return { ...msg, canStand };
}

type StepFunc = OperationStep<CanStandAtArgs, Out>;
const typeCheck: StepFunc = canStandAtPositionStep;

export const canStandAtPosition = typeCheck as typeof canStandAtPositionStep;
