import { Component, ComponentConstructor } from 'rad-ecs';
export interface RemoveSelfConditionData {
  componentType: ComponentConstructor;
  property: string;
  minimum: number;
}
export class RemoveSelfCondition extends Component implements RemoveSelfConditionData {
  public readonly componentType: ComponentConstructor;
  public readonly property: string;
  public readonly minimum: number;
  constructor(data: RemoveSelfConditionData) {
    super();
    Object.assign(this, data);
  }
}
