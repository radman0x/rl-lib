import { Component } from 'rad-ecs';

export class Targeted extends Component {
  public readonly range: number;

  constructor(data: { range: number }) {
    super();
    Object.assign(this, data);
  }
}
