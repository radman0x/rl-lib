import { Component } from 'rad-ecs';
export interface RemoveSelfConditionData {
  componentType: string;
  property: string;
  minimum: number;
}
export class RemoveSelfCondition extends Component implements RemoveSelfConditionData {
  public readonly componentType: string;
  public readonly property: string;
  public readonly minimum: number;
  constructor(data: RemoveSelfConditionData) {
    super();
    Object.assign(this, data);
  }
}
