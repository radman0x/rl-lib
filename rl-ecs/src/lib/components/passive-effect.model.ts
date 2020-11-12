import { Component } from 'rad-ecs';

export interface PassiveEffectData {}
export class PassiveEffect extends Component implements PassiveEffectData {
  constructor(data: PassiveEffectData = {}) {
    super();
    Object.assign(this, data);
  }
}
