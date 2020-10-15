import { EntityId } from 'rad-ecs';

export interface Coord {
  x: number;
  y: number;
  z: number;
}
export interface Hashable {
  hash: () => string;
}

export class ValueMap<K extends Hashable, V> {
  private index = new Map<string, { k: K; v: V }>();

  constructor() {}

  *[Symbol.iterator]() {
    for (let [, entry] of this.index) {
      yield <[K, V]>[entry.k, entry.v];
    }
  }

  delete(key: K): void {
    this.index.delete(key.hash());
  }

  entries() {
    return this.index.entries();
  }

  values() {
    return this.index.values();
  }
  has(key: K): boolean {
    return this.index.has(key.hash());
  }

  set(key: K, value: V) {
    this.index.set(key.hash(), { k: key, v: value });
  }

  get(key: K) {
    let entry = this.index.get(key.hash());
    return entry ? entry.v : undefined;
  }

  get size(): number {
    return this.index.size;
  }

  count(): number {
    return this.index.size;
  }
}

export function xyPositionsAround(pos: Coord): Coord[] {
  let around: Coord[] = [];
  for (let x = -1; x <= 1; ++x) {
    for (let y = -1; y <= 1; ++y) {
      if (x === 0 && y === 0) {
        continue;
      } else {
        around.push({ x: pos.x + x, y: pos.y + y, z: pos.z });
      }
    }
  }
  return around;
}

export function xyWithinBounds(
  bottomLeft: Coord,
  dimensions: Dimensions,
  ...candidates: Coord[]
): boolean {
  const inside = candidates.filter((c: Coord) => {
    const minX = Math.min(bottomLeft.x, bottomLeft.x + dimensions.width);
    const maxX = Math.max(bottomLeft.x, bottomLeft.x + dimensions.width);
    const minY = Math.min(bottomLeft.y, bottomLeft.y + dimensions.height);
    const maxY = Math.max(bottomLeft.y, bottomLeft.y + dimensions.height);
    return c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY;
  });

  return inside.length === candidates.length;
}

export function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length)];
}

export function popRandomElement<T>(array: T[]): T {
  const index = randomInt(0, array.length - 1);
  const chosen = array[index];
  array.splice(index, 1);
  return chosen;
}

export class Dimensions {
  constructor(public width: number, public height: number) {}

  toString(): string {
    return `{${this.width}, ${this.height}}`;
  }
}

export function randomInt(min: number, max: number): number | never {
  if (min >= max) {
    throw Error(`Random range, min: ${min} -> ${max}, is invalid`);
  }
  min = Math.floor(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

export enum CompassDirection {
  N = 'North',
  NE = 'North-East',
  E = 'East',
  SE = 'South-East',
  S = 'South',
  SW = 'South-West',
  W = 'West',
  NW = 'North-West',
}

export const compassDirectionToUnitVector: Map<
  CompassDirection,
  Coord
> = new Map([
  [CompassDirection.N, { x: 0, y: 1, z: 0 }],
  [CompassDirection.NE, { x: 1, y: 1, z: 0 }],
  [CompassDirection.E, { x: 1, y: 0, z: 0 }],
  [CompassDirection.SE, { x: 1, y: -1, z: 0 }],
  [CompassDirection.S, { x: 0, y: -1, z: 0 }],
  [CompassDirection.SW, { x: -1, y: -1, z: 0 }],
  [CompassDirection.W, { x: -1, y: 0, z: 0 }],
  [CompassDirection.NW, { x: -1, y: 1, z: 0 }],
]);

export const DIR_FROM_KEY = new Map<string, CompassDirection>([
  ['1', CompassDirection.SW],

  ['ArrowDown', CompassDirection.S],
  ['2', CompassDirection.S],

  ['3', CompassDirection.SE],

  ['ArrowLeft', CompassDirection.W],
  ['4', CompassDirection.W],

  ['ArrowRight', CompassDirection.E],
  ['6', CompassDirection.E],

  ['7', CompassDirection.NW],

  ['ArrowUp', CompassDirection.N],
  ['8', CompassDirection.N],

  ['9', CompassDirection.NE],
]);

export const DIR_FROM_KEY_VI = new Map<string, CompassDirection>([
  ['1', CompassDirection.SW],
  ['b', CompassDirection.SW],

  ['ArrowDown', CompassDirection.S],
  ['2', CompassDirection.S],
  ['j', CompassDirection.S],

  ['3', CompassDirection.SE],
  ['n', CompassDirection.SE],

  ['ArrowLeft', CompassDirection.W],
  ['4', CompassDirection.W],
  ['h', CompassDirection.W],

  ['ArrowRight', CompassDirection.E],
  ['6', CompassDirection.E],
  ['l', CompassDirection.E],

  ['7', CompassDirection.NW],
  ['y', CompassDirection.NW],

  ['ArrowUp', CompassDirection.N],
  ['8', CompassDirection.N],
  ['k', CompassDirection.N],

  ['9', CompassDirection.NE],
  ['u', CompassDirection.NE],
]);

export function withinRange(range: number, target: Coord, start: Coord) {
  return (
    Math.abs(target.x - start.x) <= range &&
    Math.abs(target.y - start.y) <= range &&
    Math.abs(target.z - start.z) <= range
  );
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function equalsVec3(lhs: Vec3, rhs: Vec3) {
  return lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z;
}
export function addVec3(lhs: Vec3, rhs: Vec3) {
  return {
    x: lhs.x + rhs.x,
    y: lhs.y + rhs.y,
    z: lhs.z + rhs.z,
  };
}

export function isValidId(id: EntityId | null | undefined) {
  return id !== null && id !== undefined;
}
