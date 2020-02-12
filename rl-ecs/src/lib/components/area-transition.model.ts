import { Component } from 'rad-ecs';
export interface AreaTransitionData {
  areaId: string;
}
export class AreaTransition extends Component implements AreaTransitionData {
  public readonly areaId: string;
  constructor(data: AreaTransitionData) {
    super();
    Object.assign(this, data);
  }
}
