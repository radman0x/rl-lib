import { Component } from 'rad-ecs';
export interface ToughnessData {
  count: number;
}
export class Toughness extends Component implements ToughnessData {
  public readonly count: number;
  constructor(data: ToughnessData) {
    super();
    Object.assign(this, data);
  }
}
