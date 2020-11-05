import { Component } from 'rad-ecs';

export interface ConsumableData {
  uses: number;
}
export class Consumable extends Component implements ConsumableData {
  public readonly uses: number;
  constructor(data: ConsumableData) {
    super();
    Object.assign(this, data);
  }
}
