import { Component } from 'rad-ecs';
export interface ArmorDeltaData {
  change: number;
}
export class ArmorDelta extends Component implements ArmorDeltaData {
  public readonly change: number;
  constructor(data: ArmorDeltaData) {
    super();
    Object.assign(this, data);
  }
}
