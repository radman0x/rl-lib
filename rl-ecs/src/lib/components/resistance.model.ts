import { Component } from 'rad-ecs';
import { EffectType } from '../systems.types';

export interface ResistanceData {
  factor: number;
  type: EffectType;
}

export abstract class Resistance extends Component {
  public readonly factor: number;
  public readonly type: EffectType;

  constructor(data: ResistanceData) {
    super();
    Object.assign(this, data);
  }
}

export class FireResistance extends Resistance {
  constructor(data: { factor: number }) {
    super({ ...data, type: EffectType.FIRE });
  }
}

export class ColdResistance extends Resistance {
  constructor(data: { factor: number }) {
    super({ ...data, type: EffectType.COLD });
  }
}
