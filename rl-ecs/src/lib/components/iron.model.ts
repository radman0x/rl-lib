import { Component } from 'rad-ecs';
import { ComponentCost } from './component-cost.model';

export interface IronData {
  count: number;
}

export class Iron extends Component implements IronData {
  public readonly count: number;
  constructor(data: IronData) {
    super();
    Object.assign(this, data);
  }
}

export class IronCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: 'Iron',
      property: 'count',
      consume: true,
    });
  }
}
