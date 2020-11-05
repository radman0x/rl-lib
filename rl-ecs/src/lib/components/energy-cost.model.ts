import { Component } from 'rad-ecs';
export interface EnergyCostData {
  amount: number;
}
export class EnergyCost extends Component implements EnergyCostData {
  public readonly amount: number;
  constructor(data: EnergyCostData) {
    super();
    Object.assign(this, data);
  }
}
