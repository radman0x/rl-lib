import { Component } from 'rad-ecs';
export interface ConsumableData {}
export class Consumable extends Component implements ConsumableData {
  constructor(data: ConsumableData) {
    super();
    Object.assign(this, data);
  }
}
