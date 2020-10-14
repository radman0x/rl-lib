import { Component } from 'rad-ecs';
export enum MentalState {
  NORMAL,
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
