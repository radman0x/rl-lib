import { Component } from 'rad-ecs';
export interface BangData {
  strength: number;
  duration: number;
}
export class Bang extends Component implements BangData {
  public readonly strength: number;
  public readonly duration: number;
  constructor(data: BangData) {
    super();
    Object.assign(this, data);
  }
}
