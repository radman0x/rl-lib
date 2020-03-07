import { Component } from 'rad-ecs';
export interface AttacksData {
  damage: number;
}
export class Attacks extends Component implements AttacksData {
  public readonly damage: number;
  constructor(data: AttacksData) {
    super();
    Object.assign(this, data);
  }
}
