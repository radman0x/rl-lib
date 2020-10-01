import { Component } from 'rad-ecs';
export interface RemoveSelfData {}
export class RemoveSelf extends Component implements RemoveSelfData {
  constructor(data: RemoveSelfData) {
    super();
    Object.assign(this, data);
  }
}
