import { Component } from 'rad-ecs';

enum Type {}

export class Usable extends Component {
  public type: Type;

  constructor(data: {}) {
    super();
    Object.assign(this, data);
  }
}
