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

export class Integrity extends Component {
  public readonly max: number;
  public readonly current: number;

  constructor(data: { max: number; current: number }) {
    super();
    this.max = data.max;
    this.current = data.current;
  }
}
