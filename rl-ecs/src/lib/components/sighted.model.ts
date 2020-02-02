import { Component } from 'rad-ecs';
export interface SightedData {
  range: number;
}
export class Sighted extends Component {
  public readonly range: number;
  constructor(data: { range: number }) {
    super();
    Object.assign(this, data);
  }
}
