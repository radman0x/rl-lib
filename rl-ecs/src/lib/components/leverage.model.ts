import { Component } from 'rad-ecs';
export interface LeverageData {
  power: number;
}
export class Leverage extends Component implements LeverageData {
  public readonly power: number;
  constructor(data: LeverageData) {
    super();
    Object.assign(this, data);
  }
}
