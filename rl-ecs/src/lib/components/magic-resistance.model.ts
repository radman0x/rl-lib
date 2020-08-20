import { Component } from 'rad-ecs';

export interface MagicResistanceData {}
export class MagicResistance extends Component implements MagicResistanceData {
  constructor(data: MagicResistanceData) {
    super();
    Object.assign(this, data);
  }
}
