import { Component } from 'rad-ecs';
export enum MentalState {
  NORMAL = 1,
  STUNNED,
}
export interface MentalData {
  state: MentalState;
}
export class Mental extends Component implements MentalData {
  public readonly state: MentalState;
  constructor(data: MentalData) {
    super();
    Object.assign(this, data);
  }
}

export class MentalOverride extends Mental {
  constructor(data: MentalData) {
    super(data);
  }
}
