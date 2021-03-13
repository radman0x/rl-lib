import { Component } from 'rad-ecs';
export interface DescriptionData {
  typeId?: string;
  short: string;
}
export class Description extends Component implements DescriptionData {
  public readonly typeId: string;
  public readonly short: string;
  constructor(data: DescriptionData) {
    super();
    Object.assign(this, data);
  }
}
