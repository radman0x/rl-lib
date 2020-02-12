import * as ROT from 'rot-js';
import { Renderable, GridPos, Physical, Size } from '..';
import { popRandomElement } from '@rad/rl-utils';
import { Component } from 'rad-ecs';
import { GridPosData } from './components/position.model';

export interface Area {
  entities: Component[][];
  startPos: GridPosData;
}
export interface Areas {
  [areaId: string]: Area;
}

const BLOCKED = 1;
const OPEN = 0;
export class AreaResolver {
  private areas: Areas;
  constructor() {
    const world = new ROT.Map.Uniform(38, 10, {
      roomDugPercentage: 0.9
    });

    const entities: Component[][] = [];
    world.create((x: number, y: number, contents: number) => {
      if (contents === BLOCKED) {
        entities.push([
          new Renderable({ image: 'Wall-110.png', zOrder: 1 }),
          new GridPos({ x, y, z: 1 }),
          new Physical({ size: Size.FILL })
        ]);
      } else if (contents === OPEN) {
        entities.push([
          new Renderable({ image: 'Floor-144.png', zOrder: 1 }),
          new GridPos({ x, y, z: 0 }),
          new Physical({ size: Size.FILL })
        ]);
      }
    });
    let rooms = world.getRooms();
    let playerRoom = popRandomElement(rooms);
    let startPos = new GridPos({
      x: playerRoom.getCenter()[0],
      y: playerRoom.getCenter()[1],
      z: 1
    });
    this.areas = {
      secondLevel: {
        startPos,
        entities
      }
    };
  }

  resolveArea(areaId: string) {
    if (areaId in this.areas) {
      return this.areas[areaId];
    } else {
      throw Error(`Area requested: ${areaId} doesn't exist!!`);
    }
  }
}
