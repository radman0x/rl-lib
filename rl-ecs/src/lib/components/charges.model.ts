import { Component } from 'rad-ecs';
export interface ChargesData {
  curr: number;
  max: number;
}
export class Charges extends Component implements ChargesData {
  public readonly curr: number;
  public readonly max: number;
  constructor(data: ChargesData) {
    super();
    Object.assign(this, data);
  }
}
