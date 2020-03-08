import { Component } from 'rad-ecs';
import { ValueMap } from '@rad/rl-utils';
import { GridPos } from './position.model';

export interface DistanceMapData {
  map: ValueMap<GridPos, number>;
}
export class DistanceMap extends Component implements DistanceMapData {
  public readonly map: ValueMap<GridPos, number>;
  constructor(data: DistanceMapData) {
    super();
    Object.assign(this, data);
  }
}
