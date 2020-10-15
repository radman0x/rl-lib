import { Component, ComponentConstructor } from 'rad-ecs';

export enum AdjustType {
  REPLACE = 1,
}

export interface ModifierDetails {
  type: ComponentConstructor;
  property: string;
  adjustType: AdjustType;
  adjustValue: any;
}
export interface ModifierData {
  entries: ModifierDetails[];
}
export class Modifier extends Component implements ModifierData {
  public readonly entries: ModifierDetails[];

  constructor(data: ModifierData) {
    super();
    Object.assign(this, data);
  }
}
