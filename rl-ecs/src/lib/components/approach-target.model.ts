import { Component, EntityId } from 'rad-ecs';

export interface ApproachTargetData {
  targetId: EntityId;
  withinRange?: number;
}
export class ApproachTarget extends Component implements ApproachTargetData {
  public readonly targetId: EntityId;
  public readonly withinRange: number;
  constructor(data: ApproachTargetData) {
    super();
    Object.assign(this, data);
  }
}
