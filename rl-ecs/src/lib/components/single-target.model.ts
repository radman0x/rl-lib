import { Component } from 'rad-ecs';

export class SingleTarget extends Component {
  constructor(data: {} = {}) {
    super();
    Object.assign(this, data);
  }
}
