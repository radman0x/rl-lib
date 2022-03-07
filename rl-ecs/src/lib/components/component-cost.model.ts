import { Component } from 'rad-ecs';

export interface ComponentCostData {
  componentType: string;
  property: string;
  amount: number;
  consume: boolean;
}

export class ComponentCost extends Component implements ComponentCostData {
  public readonly componentType: string;
  public readonly property: string;
  public readonly amount: number;
  public readonly consume: boolean;
  constructor(data: ComponentCostData) {
    super();
    Object.assign(this, data);
  }
}
