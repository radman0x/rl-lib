import { Component, EntityId } from 'rad-ecs';

export interface AbilitiesData {
  contents: EntityId[];
}
export class Abilities extends Component implements AbilitiesData {
  public readonly contents: EntityId[];

  constructor(data: AbilitiesData) {
    super();
    Object.assign(this, data);
  }
}
