import { Entity, EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { map, delay, tap, mergeMap, reduce, concatMap } from 'rxjs/operators';
import { GridPos } from '../components/position.model';
import { Renderable } from '../components/renderable.model';
import { EntityId } from '../ecs.types';

type Rename<T, K extends keyof T, N extends string> = Pick<
  T,
  Exclude<keyof T, K>
> &
  { [P in N]: T[K] };

/** Rename a key in an object
 *
 * @param o - Object where the key is to be renamed
 * @param key - Name of the key to rename
 * @param to - Rename the key to this
 *
 * @returns - The input object with the key renamed
 */
export function renameKey<T, K extends keyof T, N extends string>(
  o: T,
  key: K,
  to: string
): Rename<T, K, N> | T {
  if (key === to) {
    return o;
  }
  if (!(key in o)) {
    throw Error(
      `Key to rename: ${key} doesn't exist in source object: ${JSON.stringify(
        o,
        null,
        2
      )}`
    );
  } else {
    Object.defineProperty(o, to, Object.getOwnPropertyDescriptor(o, key)!);
    delete o[key];
    return (o as unknown) as Rename<T, K, N>;
  }
}

export function positionsWithinRadius(
  center: GridPos,
  radius: number
): GridPos[] {
  const out: GridPos[] = [];
  for (let x = -radius; x <= radius; ++x) {
    for (let y = -radius; y <= radius; ++y) {
      for (let z = -radius; z <= radius; ++z) {
        out.push(
          new GridPos({
            x: center.x + x,
            y: center.y + y,
            z: center.z + z
          })
        );
      }
    }
  }
  return out;
}

export function entitiesWithinRadius(
  center: GridPos,
  radius: number,
  em: EntityManager
): Entity[] {
  return positionsWithinRadius(center, radius)
    .map(p => em.matchingIndex(p))
    .flat();
}

export function aoeAnimation(em: EntityManager, image: string) {
  const animationOperator = <T extends Observable<any>>(obs: T) => {
    return obs.pipe(
      mergeMap((msg, i) => {
        return of(...positionsWithinRadius(msg.aoeCenter, msg.aoeRadius)).pipe(
          singleAnim(em, image),
          reduce(() => msg)
        );
      })
    );
  };
  return animationOperator;
}

function singleAnim(em: EntityManager, image: string) {
  const animationOperator = <T extends Observable<GridPos>>(obs: T) => {
    return obs.pipe(
      map(p => {
        const id = em.createEntity(
          new Renderable({ image, zOrder: 99, uiElem: true }),
          p
        ).id;
        return id;
      }),
      delay(1000),
      tap(id => em.remove(id))
    );
  };
  return animationOperator;
}
