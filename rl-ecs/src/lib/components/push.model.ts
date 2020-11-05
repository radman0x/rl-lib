import { Component } from 'rad-ecs';
export interface PushData {
  strength: number;
}
export class Push extends Component implements PushData {
  public readonly strength: number;
  constructor(data: PushData) {
    super();
    Object.assign(this, data);
  }
}
