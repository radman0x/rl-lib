import { ComponentCost } from '@rad/rl-ecs';
import { Component } from 'rad-ecs';
export interface ClottingData {
  count: number;
}
export class Clotting extends Component implements ClottingData {
  public readonly count: number;
  constructor(data: ClottingData) {
    super();
    Object.assign(this, data);
  }
}

export class ClottingCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: Clotting,
      property: 'count',
      consume: true,
      name: 'Beetle scales',
    });
  }
}
