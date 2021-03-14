import { Component } from 'rad-ecs';
export interface HealData {
  amount: number;
}
export class Heal extends Component implements HealData {
  public readonly amount: number;
  constructor(data: HealData) {
    super();
    Object.assign(this, data);
  }
}
