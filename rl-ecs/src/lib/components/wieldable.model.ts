import { Component } from 'rad-ecs';

export interface WieldableData {
  slots: number;
}

export class Wieldable extends Component implements WieldableData {
  public readonly slots: number;
  constructor(data: WieldableData) {
    super();
    Object.assign(this, data);
  }
}
