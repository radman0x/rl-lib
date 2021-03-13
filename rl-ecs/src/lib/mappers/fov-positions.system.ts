import { Entity, EntityId, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { Blockage } from '../components/blockage.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { Sighted } from '../components/sighted.model';

export function fovPositions(
  em: EntityManager,
  sightedId: EntityId,
  range: number,
  viewerPos: GridPos
) {
  const sighted = em.getComponent(sightedId, Sighted);

  const canSee = (x: number, y: number) => {
    let blocking = em
      .matchingIndex(new GridPos({ x, y, z: viewerPos.z }))
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
    viewerPos.x,
    viewerPos.y,
    range,
    (x: number, y: number, r: number, v: number) => {
      const pos = new GridPos({ x, y, z: viewerPos.z });
      viewedPositions.push(pos);
    }
  );
  return viewedPositions;
}
