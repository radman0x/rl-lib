import { Component } from 'rad-ecs';
import { Coord } from '@rad/rl-utils';

export interface TeleportData {
  target: Coord;
}
export class Teleport extends Component {
  public readonly target: Coord;
  constructor(data: TeleportData) {
    super();
    Object.assign(this, data);
  }
}
