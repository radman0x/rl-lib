import { Component } from 'rad-ecs';
import { DamageType } from '../systems.types';

export interface ResistanceData {
  factor: number;
  type: DamageType;
}

export abstract class Resistance extends Component {
  public readonly factor: number;
  public readonly type: DamageType;

  constructor(data: ResistanceData) {
    super();
    Object.assign(this, data);
  }
}

export class FireResistance extends Resistance {
  constructor(data: { factor: number }) {
    super({ ...data, type: DamageType.FIRE });
  }
}

export class ColdResistance extends Resistance {
  constructor(data: { factor: number }) {
    super({ ...data, type: DamageType.COLD });
  }
}
