import { Component } from 'rad-ecs';

export enum DamageType {
  FIRE,
  COLD
}

export interface DamageData {
  type: DamageType
  amount: number
}

export class Damage extends Component implements DamageData {

  public readonly type: DamageType;
  public readonly amount: number;
  constructor(data: {type: DamageType, amount: number})
  {
    super();
    Object.assign(this, data);
  }

}

