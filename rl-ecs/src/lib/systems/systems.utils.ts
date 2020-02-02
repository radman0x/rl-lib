import * as deepClone from 'clone-deep';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { DamageData } from '../components/damage.model';
import { DisplayOnly } from '../components/display-only.model';
import { LockState } from '../components/lock.model';
import { GridPos, GridPosData } from '../components/position.model';
import { Renderable } from '../components/renderable.model';
import { ActiveEffect, TargetPos } from './systems.types';

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
  center: GridPosData,
  radius: number
): GridPosData[] {
  const out: GridPosData[] = [];
  if (radius === 0) {
    return out;
  }
  for (let x = -radius; x <= radius; ++x) {
    for (let y = -radius; y <= radius; ++y) {
      for (let z = -radius; z <= radius; ++z) {
        out.push({
          x: center.x + x,
          y: center.y + y,
          z: center.z + z
        });
      }
    }
  }
  return out;
}

export function singleAnim(em: EntityManager, image: string) {
  const animationOperator = <T extends Observable<TargetPos & ActiveEffect>>(
    obs: T
  ) => {
    return obs.pipe(
      map(msg => {
        console.log(`ANIMATE: Creating image: ${image}`);
        const id = em.createEntity(
          new Renderable({ image, zOrder: 99, uiElem: true }),
          new GridPos(msg.targetPos),
          new DisplayOnly()
        ).id;
        return id;
      }),
      delay(500),
      tap(id => em.remove(id))
    );
  };
  return animationOperator;
}

export function isNotNull<T>(a: T | null): a is T {
  return a !== null;
}

export function isNotUndefined<T>(a: T | undefined): a is T {
  return a !== undefined;
}

export function radClone<T>(source: T): T {
  return deepClone(source) as T;
}

export function hasProtagId<T>(a: T): a is T & { protagId: EntityId } {
  return a['protagId'] !== undefined;
}

export function hasSelectedPos<T>(a: T): a is T & { selectedPos: GridPosData } {
  return a['selectedPos'] !== undefined;
}

export function hasDamage<T>(a: T): a is T & { damage: DamageData } {
  return a['damage'] !== undefined;
}

export function hasLockChange<T>(a: T): a is T & { lockChange: LockState } {
  return a['lockChange'] !== undefined;
}

export function hasCombatTarget<T>(
  a: T
): a is T & { combatTargetId: EntityId } {
  return a['combatTargetId'] !== undefined;
}

export function noCombatTarget<T>(a: T): a is T & { combatTargetId: EntityId } {
  return !hasCombatTarget(a);
}

export function canOccupyStandAndNotBlocked<
  T extends { canOccupy: boolean; canStand: boolean; isBlocked: boolean }
>(a: T): a is T & { canOccupy: true; canStand: true; isBlocked: false } {
  console.log(`Testing move: ${JSON.stringify(a, null, 2)}`);
  return a.canOccupy && a.canStand && !a.isBlocked; /*?*/
}
