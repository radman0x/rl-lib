import { Component, EntityId } from 'rad-ecs';
export interface NonePresentData {
  entities: EntityId[];
}
export class NonePresent extends Component implements NonePresentData {
  public readonly entities: EntityId[];
  constructor(data: NonePresentData) {
    super();
    Object.assign(this, data);
  }
}
