import { Component } from 'rad-ecs';

export interface GridPosData {
  x: number;
  y: number;
  z: number;
}
export class GridPos extends Component implements GridPosData {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;
  constructor(data: GridPosData) {
    super();
    Object.assign(this, data);
  }

  add(rhs: GridPos): GridPos {
    return new GridPos({
      x: this.x + rhs.x,
      y: this.y + rhs.y,
      z: this.z + rhs.z,
    });
  }

  hash(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  toString(): string {
    return `{${this.x}, ${this.y}, ${this.z}}`;
  }

  static hashRe = /([0-9]+),([0-9]+),([0-9]+)/;
  static fromHash(hash: string) {
    if (!GridPos.hashRe.test(hash)) {
      throw Error(`Attempt to create GridPos from hash: ${hash}`);
    }
    const [, x, y, z] = GridPos.hashRe.exec(hash);
    return new GridPos({ x: +x, y: +y, z: +z });
  }
}
