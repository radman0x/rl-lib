import { AreaTransitionSpec, GridPos } from '@rad/rl-ecs';
import { randomElement, randomInt, ValueMap } from '@rad/rl-utils';
import { Component, EntityId, EntityManager } from 'rad-ecs';

export class Room {
  public x1: number;
  public x2: number;
  public y1: number;
  public y2: number;
  constructor(coords: { x1: number; x2: number; y1: number; y2: number }) {
    Object.assign(this, coords);
  }

  getCenter(): Pos2d {
    return new Pos2d(this.middleOf(this.x1, this.x2), this.middleOf(this.y1, this.y2));
  }

  randomPos(): Pos2d {
    let x = randomInt(this.x1, this.x2);
    let y = randomInt(this.y1, this.y2);
    return new Pos2d(x, y);
  }

  private middleOf(min: number, max: number) {
    return Math.floor((max - min) / 2);
  }
}

export class Pos2d {
  constructor(public x: number, public y: number) {}

  hash() {
    return `${this.x},${this.y}`;
  }
}

export type TakenCb = (Pos2d) => boolean;
export type MarkTakenCb = ({ x, y, z }, id: EntityId) => void;

export function randomNotTakenRoomPos(rooms: Room, taken: TakenCb) {
  let pos: Pos2d;
  do {
    pos = rooms.randomPos();
  } while (taken(pos));

  return pos;
}

export function randomNotTakenRoomsPos(rooms: Room[], z: number, taken: TakenCb) {
  let pos: { x: number; y: number; z: number };
  do {
    pos = randomRoomsPos(rooms, z);
  } while (taken(pos));

  return pos;
}

export function randomRoomsPos(rooms: Room[], z: number) {
  let room = randomElement(rooms);
  let x = randomInt(room.x1, room.x2);
  let y = randomInt(room.y1, room.y2);
  return { x, y, z };
}

export const randomMiddleRoomsPos = (rooms: Room[], z: number) => {
  let room = randomElement(rooms);
  return {
    x: room.getCenter().x,
    y: room.getCenter().y,
    z,
  };
};

export function placeEntityInRandomRoom(
  id: EntityId,
  em: EntityManager,
  rooms: Room[],
  z: number,
  isTaken: TakenCb,
  markTaken: MarkTakenCb
) {
  const chosenPos = randomNotTakenRoomsPos(rooms, z, isTaken);
  em.setComponent(id, new GridPos(chosenPos));
  markTaken(chosenPos, id);
  return new GridPos(chosenPos);
}

export interface DungeonTemplate {
  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: DungeonPlacer[]
  ): void;

  generateEnemies(spawnable: GridPos[]): number;

  kind: 'DUNGEON';
}

export interface CaveTemplate {
  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: CavePlacer[]
  ): void;

  generateEnemies(spawnable: GridPos[]): number;

  kind: 'CAVE';
}

export interface StaticTemplate {
  generate(
    em: EntityManager,
    transitions: AreaTransitionSpec,
    depth: number,
    placers: DungeonPlacer[]
  ): void;

  generateEnemies(spawnable: GridPos[]): number;

  kind: 'STATIC';
}

export interface DungeonPlacerState {
  rooms: Room[];
  takenMap: ValueMap<Pos2d, EntityId>;
}

export interface CavePlacerState {
  openList: Pos2d[];
  takenMap: ValueMap<Pos2d, EntityId>;
}

export class DungeonPlacer {
  kind: 'DUNGEON' = 'DUNGEON';
  constructor(
    public place: (em: EntityManager, depth: number, state: DungeonPlacerState) => void
  ) {}
}

export class CavePlacer {
  kind: 'CAVE' = 'CAVE';
  constructor(public place: (em: EntityManager, depth: number, state: CavePlacerState) => void) {}
}

export type EntityCreator = (em: EntityManager, ...extras: Component[]) => EntityId;

export interface BaseGenOptions {
  height: number;
  width: number;
  floor: EntityCreator;
  fill: EntityCreator;
  upTransitionTexture: string;
  downTransitionTexture: string;
  enemyChance: number;
  enemyGenerator: (pos: GridPos) => EntityId;
  itemGenerator: (pos: GridPos) => EntityId;
  initialEnemyCount: number;
  maxEnemyCount: number;
  initialItemRange: { min: number; max: number };
}

export interface DungeonGenOptions extends BaseGenOptions {
  corridor: EntityCreator;
  door: EntityCreator;
  wall: EntityCreator;
  chasm: EntityCreator;
  placers: DungeonPlacer[];
}

export interface CaveGenOptions extends BaseGenOptions {
  placers: CavePlacer[];
}

export enum ROTOpenType {
  OPEN = 0,
  BLOCKED = 1,
}
