import { Component } from 'rad-ecs';
export interface MovingAgentData {}
export class MovingAgent extends Component implements MovingAgentData {
  constructor(data: MovingAgentData) {
    super();
    Object.assign(this, data);
  }
}
