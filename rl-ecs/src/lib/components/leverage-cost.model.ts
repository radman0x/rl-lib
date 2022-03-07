import { ComponentCost } from './component-cost.model';

export class LeverageCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: 'Leverage',
      property: 'power',
      consume: true,
    });
  }
}
