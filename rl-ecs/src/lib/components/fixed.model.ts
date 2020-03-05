import { Component } from 'rad-ecs';
export interface FixedData {}
export class Fixed extends Component implements FixedData {
  constructor(data: FixedData) {
    super();
    Object.assign(this, data);
  }
}
