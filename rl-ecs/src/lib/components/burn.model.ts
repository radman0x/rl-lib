import { Component } from 'rad-ecs';

export class Burn extends Component {
  public readonly intensity: number;
  constructor(data: { intensity: number }) {
    super();
    Object.assign(this, data);
  }
}
