import { Component } from 'rad-ecs';

export class DisplayOnly extends Component {
  constructor(data: {} = {}) {
    super();
    Object.assign(this, data);
  }
}
