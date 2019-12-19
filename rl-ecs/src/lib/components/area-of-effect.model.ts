import { Component } from 'rad-ecs';

export class AreaOfEffect extends Component {
  public radius: number;

  constructor(data: { radius: number }) {
    super();
    Object.assign(this, data);
  }
}
