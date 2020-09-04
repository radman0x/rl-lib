import { Component } from 'rad-ecs';
export interface MobileData {
  range: number;
}
export class Mobile extends Component implements MobileData {
  public readonly range: number;
  constructor(data: MobileData) {
    super();
    Object.assign(this, data);
  }
}
