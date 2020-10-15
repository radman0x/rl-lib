import { Component } from 'rad-ecs';

export enum AlignmentType {
  GOOD,
  EVIL
}
export interface AlignmentData {
  type: AlignmentType;
}
export class Alignment extends Component implements AlignmentData {
  public readonly type: AlignmentType;
  constructor(data: AlignmentData) {
    super();
    Object.assign(this, data);
  }

}
