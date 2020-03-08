import { Component } from 'rad-ecs';
export interface AttackingAgentData {}
export class AttackingAgent extends Component implements AttackingAgentData {
  constructor(data: AttackingAgentData) {
    super();
    Object.assign(this, data);
  }
}
