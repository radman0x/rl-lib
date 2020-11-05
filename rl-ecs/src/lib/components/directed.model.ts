import { CompassDirection } from '@rad/rl-utils';
import { Component } from 'rad-ecs';

export interface DirectedData {}

export class Directed extends Component implements DirectedData {
  constructor(data: DirectedData = {}) {
    super();
    Object.assign(this, data);
  }
}
