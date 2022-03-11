import { Mana, Wounds } from '@rad/rl-ecs';
import { Component, ComponentConstructor } from 'rad-ecs';

export interface RecoverData {
  componentType: ComponentConstructor;
  property: string;
  amount: number;
  probability: number;
  name: string;
  desc: string;
}

export class Recover extends Component implements RecoverData {
  public readonly componentType: ComponentConstructor;
  public readonly property: string;
  public readonly amount: number;
  public readonly probability: number;
  public readonly name: string;
  public readonly desc: string;

  constructor(data: RecoverData) {
    super();
    Object.assign(this, data);
  }
}

export class ManaRecover extends Recover {
  constructor(data: { amount: number; probability: number }) {
    super({
      ...data,
      componentType: Mana,
      property: 'curr',
      name: 'recuperation',
      desc: 'energy recovers slightly',
    });
  }
}

export class WoundsRecover extends Recover {
  constructor(data: { amount: number; probability: number; desc: string }) {
    super({
      ...data,
      componentType: Wounds,
      property: 'current',
      name: 'regeneration',
    });
  }
}
