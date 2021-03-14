import * as deepClone from 'clone-deep';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { ClimbableData } from './components/climbable.model';
import { DamageData } from './components/damage.model';
import { DisplayOnly } from './components/display-only.model';
import { GridPos, GridPosData } from './components/position.model';
import { Renderable } from './components/renderable.model';
import {
  ActiveEffect,
  LockChange,
  ReapedEntity,
  TargetPos,
  Teleported,
  NewPosition,
  AttackOrder,
} from './systems.types';
import { TransitionAreaOut } from './mappers/transition-area.system';
import { Id } from '@rad/rl-applib';
import { Description } from './components/description.model';
import { Attacks } from './components/attacks.model';

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

/** Add a property to an object, returning the type with the added property
 */
export type PropObject<PropKeys extends string, ValueType> = {
  [K in PropKeys]: ValueType;
};

/** Returns a new object that is a copy of the input but with a property added
 */
export function addProperty<O extends object, K extends string, V>(
  input: O,
  key: K,
  value: V
): Id<O & PropObject<K, V>> {
  const copy = radClone(input);
  Object.defineProperty(copy, key, {
    value: radClone(value),
    enumerable: true,
    writable: true,
    configurable: true,
  });
  return copy as O & PropObject<K, V>;
}

export function positionsWithinRadius2d(
  center: GridPosData,
  radius: number
): GridPosData[] {
  const out: GridPosData[] = [];
  if (radius === 0) {
    return out;
  }
  for (let x = -radius; x <= radius; ++x) {
    for (let y = -radius; y <= radius; ++y) {
      out.push({
        x: center.x + x,
        y: center.y + y,
        z: center.z,
      });
    }
  }
  return out;
}

export function positionsWithinRadius3d(
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
          z: center.z + z,
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
      map((msg) => {
        console.log(`ANIMATE: Creating image: ${image}`);
        const id = em.create(
          new Renderable({ image, zOrder: 99, uiElem: true }),
          new GridPos(msg.targetPos),
          new DisplayOnly()
        ).id;
        return id;
      }),
      delay(500),
      tap((id) => em.remove(id))
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

export function strikeSuccess<T>(a: T): a is T & { strikeSuccess: true } {
  return a['strikeSuccess'] === true;
}

export function strikeFailure<T>(a: T): a is T & { strikeSuccess: false } {
  return a['strikeSuccess'] === false;
}

export function woundSuccess<T>(a: T): a is T & { woundSuccess: true } {
  return a['woundSuccess'] === true;
}

export function woundFailure<T>(a: T): a is T & { woundSuccess: false } {
  return a['woundSuccess'] === false;
}

export function hasDamage<T>(a: T): a is T & { damage: DamageData } {
  return a['damage'] !== undefined;
}

export function hasAreaTransition<T>(
  a: T
): a is T & Required<TransitionAreaOut> {
  return a['areaTransition'] !== undefined;
}

export function hasSpatialChange<T>(a: T): a is T & { teleport: Teleported } {
  return a['teleport'] !== undefined;
}

export function hasLockChange<T>(a: T): a is T & Required<LockChange> {
  return a['lockChange'] !== undefined;
}

export function hasClimbable<T>(a: T): a is T & { climbable: ClimbableData } {
  return a['climbable'] !== undefined;
}

export function hasReaped<T>(a: T): a is T & ReapedEntity {
  return a['reapedEntity'] !== undefined;
}

export function isAttackingAI<T>(a: T): a is T & { attackingAI: true } {
  return a['attackingAI'] === true;
}

export function notAttackingAI<T>(a: T): a is T & { attackingAI: false } {
  return a['attackingAI'] === false;
}
export function hasCombatTarget<T>(
  a: T
): a is T & { combatTargetId: EntityId } {
  console.log(`Has combat target?: ${a['combatTargetId']}`);
  return a['combatTargetId'] !== null && a['combatTargetId'] !== undefined;
}

export function noCombatTarget<T>(a: T): a is T {
  return !hasCombatTarget(a);
}

export function hasOutcomeDescription<T>(
  a: T
): a is T & {
  worldStateChangeDescription: string;
  activeEffectDescription: string;
} {
  return a['worldStateChangeDescription'] && a['activeEffectDescription'];
}

export function canOccupyStandAndNotBlocked<
  T extends { canOccupy: boolean; canStand: boolean; isBlocked: boolean }
>(a: T): a is T & { canOccupy: true; canStand: true; isBlocked: false } {
  return a.canOccupy && a.canStand && !a.isBlocked; /*?*/
}

export function cannotOccupyStandOrIsBlocked<
  T extends { canOccupy: boolean; canStand: boolean; isBlocked: boolean }
>(
  a: T
): a is T & { canOccupy: boolean; canStand: boolean; isBlocked: boolean } {
  return !a.canOccupy || !a.canStand || a.isBlocked; /*?*/
}

export function hasNewPosition<T>(a: T): a is T & NewPosition {
  return a['newPosition'] !== null && a['newPosition'] !== undefined;
}

export function noNewPosition<T>(a: T): a is T {
  return !hasNewPosition(a);
}

export type RadRxOperator<T, U> = (input: Observable<T>) => Observable<T & U>;

export function playerCombatString(
  msg: AttackOrder,
  em: EntityManager
): string | null {
  if (msg && msg.combatTargetId) {
    let targetDescription = em.getComponent(msg.combatTargetId, Description)
      ?.short;
    targetDescription = targetDescription ?? 'unnamed';
    if (msg.reapedId) {
      // return `You kill the ${targetDescription}!`;
    } else if (msg.woundSuccess && msg.strikeSuccess && !msg.armorSaveSuccess) {
      return `You hit the ${targetDescription}!`;
    } else if (msg.woundSuccess && msg.strikeSuccess && msg.armorSaveSuccess) {
      return `You hit the ${targetDescription} but it's blocked by its armor.`;
    } else {
      return `You miss the ${targetDescription}.`;
    }
  }
  return null;
}
export function enemyCombatString(
  msg: AttackOrder,
  em: EntityManager
): string | null {
  if (msg && msg.combatTargetId) {
    const aggressorDescription = em.hasComponent(msg.aggressorId, Description)
      ? em.getComponent(msg.aggressorId, Description).short
      : 'unnamed';
    const aggressorAttack = em.hasComponent(msg.aggressorId, Attacks)
      ? em.getComponent(msg.aggressorId, Attacks).description
      : 'hits';
    if (msg.reapedId) {
      return `The ${aggressorDescription} kills you!`;
    } else if (msg.woundSuccess && msg.strikeSuccess && !msg.armorSaveSuccess) {
      return `The ${aggressorDescription} ${aggressorAttack}s!`;
    } else if (msg.woundSuccess && msg.strikeSuccess && msg.armorSaveSuccess) {
      return `The ${aggressorDescription}'s ${aggressorAttack} is blocked by your armour.`;
    } else {
      return `The ${aggressorDescription} misses.`;
    }
  }
  return null;
}
