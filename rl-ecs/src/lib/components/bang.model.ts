import { Component } from 'rad-ecs';
export interface BangData {
  duration: number;
}
export class Bang extends Component implements BangData {
  public readonly duration: number;
  constructor(data: BangData) {
    super();
    Object.assign(this, data);
  }
}
