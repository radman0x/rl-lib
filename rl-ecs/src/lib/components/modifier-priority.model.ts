import { Component } from 'rad-ecs';
export interface ModifierPriorityData {
  score: number;
}
export class ModifierPriority extends Component
  implements ModifierPriorityData {
  public readonly score: number;
  constructor(data: ModifierPriorityData) {
    super();
    Object.assign(this, data);
  }
}
