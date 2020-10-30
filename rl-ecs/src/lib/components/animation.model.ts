import { Component } from 'rad-ecs';
export interface AnimationData {
  name: string;
  speed: number;
  scale: number;
}
export class Animation extends Component implements AnimationData {
  public readonly name: string;
  public readonly speed: number;
  public readonly scale: number;
  constructor(data: AnimationData) {
    super();
    Object.assign(this, data);
  }
}
