import { Component, ComponentConstructor } from 'rad-ecs';
export interface OnlySpecificData {
  componentType: ComponentConstructor;
}
export class OnlySpecific extends Component implements OnlySpecificData {
  public readonly componentType: ComponentConstructor;
  constructor(data: OnlySpecificData) {
    super();
    Object.assign(this, data);
  }
}
