import { Component } from 'rad-ecs';
import { EffectType } from '../systems.types';

export interface DamageData {
  type: EffectType;
  amount: number;
}

export class Damage extends Component implements DamageData {
  public readonly type: EffectType;
  public readonly amount: number;
  constructor(data: { type: EffectType; amount: number }) {
    super();
    Object.assign(this, data);
  }
}
