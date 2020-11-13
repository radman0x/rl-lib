import { Component } from 'rad-ecs';
export interface ArmorData {
  count: number;
}
export class Armor extends Component implements ArmorData {
  public readonly count: number;
  constructor(data: ArmorData) {
    super();
    Object.assign(this, data);
  }
}
