import { Component, EntityId } from 'rad-ecs';

export interface StatusEffectsData {
  contents: EntityId[];
}

export class StatusEffects extends Component implements StatusEffectsData {
  public readonly contents: EntityId[];
  constructor(data: StatusEffectsData) {
    super();
    Object.assign(this, data);
  }
}
