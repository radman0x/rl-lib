import { Component } from 'rad-ecs';
export interface WoundsData {
  max: number;
  current: number;
}
export class Wounds extends Component implements WoundsData {
  public readonly max: number;
  public readonly current: number;
  constructor(data: WoundsData) {
    super();
    Object.assign(this, data);
  }
}
