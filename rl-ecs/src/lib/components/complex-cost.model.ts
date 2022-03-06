import { Component } from 'rad-ecs';

export interface ComplexCostData {
  [componentName: string]: {
    property: string;
    count: number;
    failureDesc: string;
  };
}

export class ComplexCost extends Component {
  public readonly costDetails: ComplexCostData;
  constructor(data: ComplexCostData) {
    super();
    this.costDetails = data;
  }
}
