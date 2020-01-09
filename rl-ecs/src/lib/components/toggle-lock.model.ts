import { Component } from 'rad-ecs';

export interface ToggleLockData {
  lockId: string;
}
export class ToggleLock extends Component {
  public readonly lockId: string;
  constructor(data: ToggleLockData) {
    super();
    Object.assign(this, data);
  }
}
