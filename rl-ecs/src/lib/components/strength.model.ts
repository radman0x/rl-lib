import { Component } from 'rad-ecs';
export interface StrengthData {
  count: number;
}
export class Strength extends Component implements StrengthData {
  public readonly count: number;
  constructor(data: StrengthData) {
    super();
    Object.assign(this, data);
  }
}
