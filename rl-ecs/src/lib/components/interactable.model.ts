import { Component } from 'rad-ecs';
export interface InteractableData {
  failureDesc: string;
}
export class Interactable extends Component implements InteractableData {
  public readonly failureDesc: string;
  constructor(data: InteractableData) {
    super();
    Object.assign(this, data);
  }
}
