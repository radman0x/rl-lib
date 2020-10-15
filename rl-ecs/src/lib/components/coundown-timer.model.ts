import { Component } from 'rad-ecs';

export interface CountdownTimerData {
  current: number;
  max: number;
}

export class CountdownTimer extends Component implements CountdownTimerData {
  public readonly current: number;
  public readonly max: number;
  constructor(data: CountdownTimerData) {
    super();
    Object.assign(this, data);
  }
}
