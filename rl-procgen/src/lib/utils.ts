import { AreaTransitionSpec, GridPos } from '@rad/rl-ecs';
import { randomElement, randomInt, ValueMap } from '@rad/rl-utils';
import { Component, EntityId, EntityManager } from 'rad-ecs';
import { Room } from 'rot-js/lib/map/features';

export class Pos2d {
  constructor(public x: number, public y: number) {}

  hash() {
    return `${this.x},${this.y}`;
  }
}

export type TakenCb = ({ x, y, z }) => boolean;
export type MarkTakenCb = ({ x, y, z }, id: EntityId) => void;

export function randomNotTakenRoomPos(
  rooms: Room[],
  z: number,
  taken: TakenCb
) {
  let pos: { x: number; y: number; z: number };
  do {
    pos = randomRoomPos(rooms, z);
  } while (taken(pos));

  return pos;
}

export function randomRoomPos(rooms: Room[], z: number) {
  let room = randomElement(rooms);
  let x = randomInt(room._x1, room._x2);
  let y = randomInt(room._y1, room._y2);
  return { x, y, z };
}

export const randomMiddleRoomPos = (rooms: Room[], z: number) => {
  let room = randomElement(rooms);
  return {
    x: room.getCenter()[0],
    y: room.getCenter()[1],
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
  const chosenPos = randomNotTakenRoomPos(rooms, z, isTaken);
  em.setComponent(id, new GridPos(chosenPos));
  markTaken(chosenPos, id);
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
    public place: (
      em: EntityManager,
      depth: number,
      state: DungeonPlacerState
    ) => void
  ) {}
}

export class CavePlacer {
  kind: 'CAVE' = 'CAVE';
  constructor(
    public place: (
      em: EntityManager,
      depth: number,
      state: CavePlacerState
    ) => void
  ) {}
}

export type EntityCreator = (em: EntityManager, ...extras: Component[]) => void;

export interface BaseGenOptions {
  height: number;
  width: number;
  floor: EntityCreator;
  fill: EntityCreator;
  upTransitionTexture: string;
  downTransitionTexture: string;
  enemyChance: number;
  enemyGenerator: (pos: GridPos) => EntityId;
  initialEnemyCount: number;
}

export interface DungeonGenOptions extends BaseGenOptions {
  corridor: EntityCreator;
  door: EntityCreator;
  wall: EntityCreator;
  placers: DungeonPlacer[];
}

export interface CaveGenOptions extends BaseGenOptions {
  placers: CavePlacer[];
}

export enum ROTOpenType {
  OPEN = 0,
  BLOCKED = 1,
}
