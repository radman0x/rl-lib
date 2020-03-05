import { Component } from 'rad-ecs';
export interface UsableData {
  useName: string;
}
export class Usable extends Component implements UsableData {
  public readonly useName: string;
  constructor(data: UsableData) {
    super();
    Object.assign(this, data);
  }
}
