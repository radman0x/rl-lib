import { Component } from 'rad-ecs';
export interface RandomMoveData {
  chance: number;
  scoreAdjust: number;
}
export class RandomMove extends Component implements RandomMoveData {
  public readonly chance: number;
  public readonly scoreAdjust: number;
  constructor(data: RandomMoveData) {
    super();
    Object.assign(this, data);
  }
}
