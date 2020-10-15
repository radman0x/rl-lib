import { Component } from 'rad-ecs';

export interface TargetOriginData {}

export class TargetOrigin extends Component implements TargetOriginData {
  constructor(data: TargetOriginData) {
    super();
    Object.assign(this, data);
  }
}
