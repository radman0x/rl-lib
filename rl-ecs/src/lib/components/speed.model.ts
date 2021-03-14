import { Component } from 'rad-ecs';
export interface SpeedData {
  currActionPoints: number;
  actionCost: number;
  recoupAmount: number;
}
export class Speed extends Component implements SpeedData {
  public readonly currActionPoints: number;
  public readonly actionCost: number;
  public readonly recoupAmount: number;
  constructor(data: SpeedData) {
    super();
    Object.assign(this, data);
  }
}
