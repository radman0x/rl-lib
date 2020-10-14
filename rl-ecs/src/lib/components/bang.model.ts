import { Component } from 'rad-ecs';
export interface BangData {
  strength: number;
}
export class Bang extends Component implements BangData {
  public readonly strength: number;
  constructor(data: BangData) {
    super();
    Object.assign(this, data);
  }
}
