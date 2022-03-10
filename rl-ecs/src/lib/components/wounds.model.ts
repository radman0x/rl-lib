import { Component } from 'rad-ecs';
export interface WoundsData {
  max: number;
  current: number;
  deathDesc: string;
}
export class Wounds extends Component implements WoundsData {
  public readonly max: number;
  public readonly current: number;
  public readonly deathDesc: string;
  constructor(data: WoundsData) {
    super();
    Object.assign(this, data);
  }
}
