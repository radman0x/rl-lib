import { Component, EntityId } from 'rad-ecs';

export interface SpawnEntityData {
  entities: EntityId[];
  replaceExisting?: boolean;
}

export class SpawnEntity extends Component implements SpawnEntityData {
  public readonly entities: EntityId[];
  public readonly replaceExisting: boolean;
  constructor(data: SpawnEntityData) {
    super();
    Object.assign(this, data);
  }
}
