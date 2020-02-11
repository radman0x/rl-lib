import { Component, EntityId } from 'rad-ecs';

export interface EffectsData {
  contents: EntityId[];
}

export class Effects extends Component implements EffectsData {
  public readonly contents: EntityId[];

  constructor(data: EffectsData) {
    super();
    Object.assign(this, data);
  }
}
