import { Component } from 'rad-ecs';
export interface CooldownData {
  curr: number;
}
export class Cooldown extends Component implements CooldownData {
  public readonly curr: number;
  constructor(data: CooldownData) {
    super();
    Object.assign(this, data);
  }
}
