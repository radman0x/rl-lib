import { Component } from 'rad-ecs';

export class GridPos extends Component {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;
  constructor(data: { x: number; y: number; z: number }) {
    super();
    Object.assign(this, data);
  }

  add(rhs: GridPos): GridPos {
    return new GridPos({
      x: this.x + rhs.x,
      y: this.y + rhs.y,
      z: this.z + rhs.z
    });
  }

  hash(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  toString(): string {
    return `{${this.x}, ${this.y}, ${this.z}}`;
  }
}
