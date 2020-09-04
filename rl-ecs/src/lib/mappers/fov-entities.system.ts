import { Id } from '@rad/rl-applib';
import { Entity, EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { Blockage } from '../components/blockage.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { SightedData } from '../components/sighted.model';
import { OperationStepMulti } from '../operation-step.model';
import { radClone } from '../systems.utils';

type Args = { sightedId: EntityId; sighted: SightedData; viewerPos: GridPos };
export type FOVEntitiesArgs = Args;

interface Out {
  viewed: {
    entityId: EntityId;
    atPos: GridPos;
  };
}
export type FOVEntitiesOut = Out;

function fovEntitiesStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out>[] {
  const canSee = (x: number, y: number) => {
    let blocking = em
      .matchingIndex(new GridPos({ x, y, z: msg.viewerPos.z }))
      .filter((e: Entity) => {
        if (e.has(Physical) && e.component(Physical).size === Size.FILL) {
          return true;
        }
        if (e.has(Blockage) && e.component(Blockage).active === true) {
          return true;
        }
        return false;
      });
    return blocking.length === 0;
  };
  let fov = new ROT.FOV.PreciseShadowcasting(canSee);

  const viewedPositions: GridPos[] = [];
  fov.compute(
    msg.viewerPos.x,
    msg.viewerPos.y,
    msg.sighted.range,
    (x: number, y: number, r: number, v: number) => {
      const pos = new GridPos({ x, y, z: msg.viewerPos.z });
      viewedPositions.push(pos);
      viewedPositions.push(new GridPos({ ...pos, z: msg.viewerPos.z - 1 }));
    }
  );

  const viewedEntities = viewedPositions.map(pos => {
    console.log(`FOV: position ${pos} currently in view`);
    return em
      .matchingIndex(pos)
      .map(e => ({ ...radClone(msg), viewed: { entityId: e.id, atPos: pos } }));
  });

  const flattenedEntities = [].concat(...viewedEntities);
  // console.log(
  //   `Entities in view: ${flattenedEntities.map(entry => entry.viewed.entityId)}`
  // );
  return flattenedEntities;
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = fovEntitiesStep;

export const fovEntities = typeCheck as typeof fovEntitiesStep;
