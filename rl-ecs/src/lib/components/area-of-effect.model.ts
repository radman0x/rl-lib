import { Component } from 'rad-ecs';

export interface AreaOfEffectData {
  radius: number;
}
export class AreaOfEffect extends Component implements AreaOfEffectData {
  public radius: number;

  constructor(data: AreaOfEffectData) {
    super();
    Object.assign(this, data);
  }
}
