import { equalsVec3, withinRange } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { Directed } from '../components/directed.model';
import { GridPos, GridPosData } from '../components/position.model';
import { TargetOrigin } from '../components/target-origin.model';
import { Targeted } from '../components/targeted.model';
import { ActiveEffect } from '../systems.types';
import {
  addProperty,
  positionsWithinRadius2d,
  radClone,
} from '../systems.utils';

import * as rxjsSpy from 'rxjs-spy';

type Args = ActiveEffect;
export function targetingPipeline<T extends Args>(
  msg: T,
  em: EntityManager,
  usingEntityId: EntityId,
  spriteAdder: (name: string, pos: GridPosData) => number,
  spriteRemover: (id: number) => void,
  tileSelected$: Observable<GridPosData>,
  logger: (message: string) => void
) {
  return of(msg).pipe(
    map((msg) => {
      const effectOrigin = em.getComponent(usingEntityId, GridPos);
      return radClone({ ...msg, effectOrigin, selectablePositions: null });
    }),
    map((msg) => {
      let selectablePositions: GridPosData[] = msg.selectablePositions || null;
      let effectRange: number = null;
      if (em.hasComponent(msg.effectId, Targeted)) {
        effectRange = em.getComponent(msg.effectId, Targeted).range;
        selectablePositions = positionsWithinRadius2d(
          msg.effectOrigin,
          effectRange
        );
      }
      return radClone({
        ...msg,
        effectId: msg.effectId,
        selectablePositions,
        effectRange,
      });
    }),
    map((msg) => {
      let selectablePositions: GridPosData[] = msg.selectablePositions || null;
      if (em.hasComponent(msg.effectId, Directed)) {
        selectablePositions = positionsWithinRadius2d(msg.effectOrigin, 1);
      }
      return radClone({ ...msg, selectablePositions });
    }),
    map((msg) => {
      const overlayIds: EntityId[] = [];
      for (let pos of msg.selectablePositions) {
        overlayIds.push(
          spriteAdder('0002_cell_selectable_overlay_white_16x16.png', pos)
        );
      }
      return addProperty(msg, 'overlayIds', overlayIds);
    }),
    mergeMap((msg) => {
      if (msg.selectablePositions && msg.selectablePositions.length !== 0) {
        return tileSelected$.pipe(
          rxjsSpy.operators.tag('useEffect.tileSelected'),
          filter((pos) => {
            if (msg.selectablePositions) {
              return (
                msg.selectablePositions.find((sPos) =>
                  equalsVec3(sPos, pos)
                ) !== undefined
              );
            } else {
              logger(`Not in range`);
              return false;
            }
          }),
          take(1),
          tap(() => {
            for (let id of msg.overlayIds) {
              spriteRemover(id);
            }
            delete msg.selectablePositions;
            delete msg.overlayIds;
          }),
          filter((xy) => !!xy),
          map((xy) =>
            addProperty(msg, 'selectedPos', {
              ...xy,
              z: msg.effectOrigin.z,
            })
          )
        );
      } else if (em.hasComponent(msg.effectId, TargetOrigin)) {
        return of(addProperty(msg, 'selectedPos', msg.effectOrigin));
      } else {
        return of(addProperty(msg, 'selectedPos', null as GridPosData));
      }
    })
  );
}
