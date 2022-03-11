import { ComponentCost } from '@rad/rl-ecs';
import { Component } from 'rad-ecs';
export interface ManaData {
  curr: number;
  max: number;
}

export class Mana extends Component implements ManaData {
  public readonly curr: number;
  public readonly max: number;
  constructor(data: ManaData) {
    super();
    Object.assign(this, data);
  }
}

export class ManaCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: Mana,
      property: 'curr',
      consume: true,
      name: 'Energy',
    });
  }
}
