import { CompassDirection } from '@rad/rl-utils';
import { Component } from 'rad-ecs';
export interface ForceData {
  magnitude: number;
  direction: CompassDirection;
}
export class Force extends Component implements ForceData {
  public readonly magnitude: number;
  public readonly direction: CompassDirection;
  constructor(data: ForceData) {
    super();
    Object.assign(this, data);
  }
}
