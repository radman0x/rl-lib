import { Component, EntityId } from 'rad-ecs';

export interface StatusEffectsData {
  list: EntityId[];
}

export class StatusEffects extends Component implements StatusEffectsData {
  public readonly list: EntityId[];
  constructor(data: StatusEffectsData) {
    super();
    Object.assign(this, data);
  }
}
