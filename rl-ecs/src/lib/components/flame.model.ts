import { Component } from 'rad-ecs';
export interface FlameData {
  strength: number;
}
export class Flame extends Component implements FlameData {
  public readonly strength: number;
  constructor(data: FlameData) {
    super();
    Object.assign(this, data);
  }
}
