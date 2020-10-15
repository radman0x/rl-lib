import { Component } from 'rad-ecs';
export interface AlwaysRenderedData {}
export class AlwaysRendered extends Component implements AlwaysRenderedData {
  constructor(data: AlwaysRenderedData) {
    super();
    Object.assign(this, data);
  }
}
