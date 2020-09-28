import { Component } from 'rad-ecs';

export interface Trigger {
  componentName: string;
  property?: string;
  value?: any;
  activeState: boolean;
}
export type Triggers = Trigger[];

export interface BlockageData {
  active: boolean;
  triggers: Triggers;
}
export class Blockage extends Component {
  public readonly active: boolean;
  public readonly triggers: Triggers;

  constructor(data: BlockageData) {
    super();
    Object.assign(this, data);
  }
}
