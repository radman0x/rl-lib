import { Component } from 'rad-ecs';
export interface WielderData {
  max: number;
}
export class Wielder extends Component implements WielderData {
  public readonly max: number;
  constructor(data: WielderData) {
    super();
    Object.assign(this, data);
  }
}
