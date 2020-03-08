import { Component } from 'rad-ecs';

export enum Size {
  SMALL,
  MEDIUM,
  LANGE,
  FILL,
  BLOCKING
}

export class Physical extends Component {
  public readonly size: Size;

  constructor(data: { size: Size }) {
    super();
    this.size = data.size;
  }
}
