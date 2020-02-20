import { Component } from 'rad-ecs';
export interface AreaIngressData {
  label: string;
}
export class AreaIngress extends Component implements AreaIngressData {
  public readonly label: string;
  constructor(data: AreaIngressData) {
    super();
    Object.assign(this, data);
  }
}
