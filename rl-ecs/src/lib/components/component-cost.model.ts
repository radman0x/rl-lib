import { Component, ComponentConstructor } from 'rad-ecs';

export interface ComponentCostData {
  componentType: ComponentConstructor;
  property: string;
  amount: number;
  consume: boolean;
  name: string;
}

export class ComponentCost extends Component implements ComponentCostData {
  public readonly componentType: ComponentConstructor;
  public readonly property: string;
  public readonly amount: number;
  public readonly consume: boolean;
  public readonly name: string;
  constructor(data: ComponentCostData) {
    super();
    Object.assign(this, data);
  }
}
