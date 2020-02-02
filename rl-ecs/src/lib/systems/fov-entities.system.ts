import { Entity, EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { Sighted, SightedData } from '../components/sighted.model';
import { OperationStepMulti } from '../operation-step.model';
import { hasProtagId } from '../systems/systems.utils';
import { ProtagonistEntity } from './systems.types';
import { radClone } from './systems.utils';

export interface HookFovEntitiesArgs {
  protagId: EntityId;
}

export function hookFOVEntities<T extends HookFovEntitiesArgs>(
  source: Observable<T>,
  dest: Subject<FOVEntitiesOut & T>,
  em: EntityManager
) {
  source
    .pipe(
      filter(hasProtagId),
      filter(msg => em.hasComponent(msg.protagId, Sighted)),
      filter(msg => em.hasComponent(msg.protagId, GridPos)),
      map(msg => ({
        ...radClone(msg),
        sighted: radClone(em.getComponent(msg.protagId, Sighted)!),
        viewerPos: radClone(em.getComponent(msg.protagId, GridPos)!)
      })),
      mergeMap(msg => of(...fovEntities(msg, em)))
    )
    .subscribe(dest);
}

type Args = ProtagonistEntity & { sighted: SightedData; viewerPos: GridPos };
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
): (T & Out)[] {
  const canSee = (x: number, y: number) => {
    let blocking = em
      .matchingIndex(new GridPos({ x, y, z: msg.viewerPos.z }))
      .filter((e: Entity) => {
        if (e.has(GridPos) && e.has(Physical)) {
          let [position, physical] = e.components(GridPos, Physical);
          return physical.size === Size.FILL && position.z === msg.viewerPos.z;
        }
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
    return em
      .matchingIndex(pos)
      .map(e => ({ ...radClone(msg), viewed: { entityId: e.id, atPos: pos } }));
  });

  return [].concat(...viewedEntities);
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = fovEntitiesStep;

export const fovEntities = typeCheck as typeof fovEntitiesStep;
