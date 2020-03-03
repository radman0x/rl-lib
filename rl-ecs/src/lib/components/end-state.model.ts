import { Component } from 'rad-ecs';

export enum EndType {
  VICTORY,
  DEFEAT
}
export interface EndStateData {
  endType: EndType;
}
export class EndState extends Component implements EndStateData {
  public readonly endType: EndType;
  constructor(data: EndStateData) {
    super();
    Object.assign(this, data);
  }
}
