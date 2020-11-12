import { Component } from 'rad-ecs';

export interface EquippedData {}

export class Equipped extends Component implements EquippedData {
  constructor(data: EquippedData = {}) {
    super();
    Object.assign(this, data);
  }
}
