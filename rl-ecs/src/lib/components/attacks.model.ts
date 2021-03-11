import { Component } from 'rad-ecs';
export interface AttacksData {
  damage: number;
  description?: string;
}
export class Attacks extends Component implements AttacksData {
  public readonly damage: number;
  public readonly description: string | undefined;
  constructor(data: AttacksData) {
    super();
    Object.assign(this, data);
  }
}
