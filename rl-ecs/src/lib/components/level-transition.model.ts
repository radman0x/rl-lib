import { Component } from 'rad-ecs';
export interface LevelTransitionData {
  levelId: string;
}
export class LevelTransition extends Component {
  public readonly levelId: string;
  constructor(data: LevelTransitionData) {
    super();
    Object.assign(this, data);
  }
}