import { GridPosData } from '@rad/rl-ecs';
import { Component } from 'rad-ecs';

export interface TargetPositionsData {
  positions: GridPosData[];
}
export class TargetPositions extends Component implements TargetPositionsData {
  public readonly positions: GridPosData[];
  constructor(data: TargetPositionsData) {
    super();
    Object.assign(this, data);
  }
}
