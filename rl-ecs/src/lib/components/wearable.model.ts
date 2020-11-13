import { Component } from 'rad-ecs';
export interface WearableData {
  slots: number;
}
export class Wearable extends Component implements WearableData {
  public readonly slots: number;
  constructor(data: WearableData) {
    super();
    Object.assign(this, data);
  }
}
