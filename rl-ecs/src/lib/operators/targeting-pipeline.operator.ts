import { equalsVec3 } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of } from 'rxjs';
import {
  dematerialize,
  filter,
  map,
  mapTo,
  materialize,
  mergeMap,
  take,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { Directed } from '../components/directed.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos, GridPosData } from '../components/position.model';
import { TargetOrigin } from '../components/target-origin.model';
import { Targeted } from '../components/targeted.model';
import { fovPositions } from '../mappers/fov-positions.system';
import { ActiveEffect } from '../systems.types';
import { addProperty, positionsWithinRadius2d, radClone } from '../systems.utils';

type Args = ActiveEffect;
export function targetingPipeline<T extends Args>(
  msg: T,
  em: EntityManager,
  usingEntityId: EntityId,
  spriteAdder: (name: string, pos: GridPosData) => number,
  spriteRemover: (id: number) => void,
  tileSelected$: Observable<GridPosData>,
  cancelTargeting$: Observable<void>,
  logger: (message: string) => void
) {
  const removeOverlays = (
    spriteRemover: (number) => void,
    msg: { selectablePositions: GridPosData[]; overlayIds: number[] }
  ) => {
    return <T>(input: Observable<T>) => {
      return input.pipe(
        tap(() => {
          for (let id of msg.overlayIds) {
            spriteRemover(id);
          }
          delete msg.selectablePositions;
          delete msg.overlayIds;
        })
      );
    };
  };

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
        selectablePositions = fovPositions(em, msg.effectId, effectRange, msg.effectOrigin);
      }
      return radClone({
        ...msg,
        effectId: msg.effectId,
        selectablePositions,
        effectRange,
      });
    }),
    map((msg) => {
      let selectablePositions: GridPosData[] = msg.selectablePositions ?? [];
      if (em.hasComponent(msg.effectId, Directed)) {
        selectablePositions = positionsWithinRadius2d(msg.effectOrigin, 1);
      }
      return radClone({ ...msg, selectablePositions });
    }),
    map((msg) => {
      let selectablePositions: GridPosData[] = msg.selectablePositions ?? [];
      selectablePositions = selectablePositions.filter(
        (pos) =>
          em
            .matchingIndex(new GridPos(pos))
            .filter((e) => e.has(Physical) && e.component(Physical).size === Size.FILL).length === 0
      );
      return radClone({ ...msg, selectablePositions });
    }),
    map((msg) => {
      const overlayIds: EntityId[] = [];
      for (let pos of msg.selectablePositions) {
        overlayIds.push(spriteAdder('0002_cell_selectable_overlay_white_16x16.png', pos));
      }
      return addProperty(msg, 'overlayIds', overlayIds);
    }),
    mergeMap((msg) => {
      if (msg.selectablePositions && msg.selectablePositions.length !== 0) {
        const cancelOrTarget$ = merge(
          tileSelected$.pipe(materialize()),
          cancelTargeting$.pipe(
            take(1),
            removeOverlays(spriteRemover, msg),
            mapTo(null),
            materialize()
          )
        ).pipe(dematerialize());
        return cancelOrTarget$.pipe(
          // rxjsSpy.operators.tag('useEffect.tileSelected'),
          filter((pos) => {
            if (pos === null) {
              logger(`Targeting cancelled`);
              return false;
            } else if (msg.selectablePositions) {
              const withinRange =
                msg.selectablePositions.find((sPos) => equalsVec3(sPos, pos)) !== undefined;
              if (!withinRange) {
                logger(`Not in range`);
              }
              return withinRange;
            } else {
              return false;
            }
          }),
          take(1),
          removeOverlays(spriteRemover, msg),
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
