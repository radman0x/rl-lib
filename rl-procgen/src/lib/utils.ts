import { GridPos } from '@rad/rl-ecs';
import { randomElement, randomInt } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
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
