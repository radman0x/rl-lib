import { Component } from 'rad-ecs';
export interface StrengthDeltaData {
  change: number;
}
export class StrengthDelta extends Component implements StrengthDeltaData {
  public readonly change: number;
  constructor(data: StrengthDeltaData) {
    super();
    Object.assign(this, data);
  }
}
