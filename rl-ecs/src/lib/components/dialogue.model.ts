import { Choices } from '@rad/rl-applib';
import { Component } from 'rad-ecs';
export interface DialogueData {
  onceOff: string[];
  random: Choices<string>;
}
export class Dialogue extends Component implements DialogueData {
  public readonly onceOff: string[];
  public readonly random: Choices<string>;

  constructor(data: DialogueData) {
    super();
    Object.assign(this, data);
  }
}
