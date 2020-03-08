import { Component } from 'rad-ecs';
export interface PlayerAgentData {}
export class PlayerAgent extends Component implements PlayerAgentData {
  constructor(data: PlayerAgentData) {
    super();
    Object.assign(this, data);
  }
}
