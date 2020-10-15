import { Component, ComponentConstructor, EntityId } from 'rad-ecs';

export interface MemberOfData {
  id: EntityId;
  component: ComponentConstructor;
  property: string;
}

export class MemberOf extends Component implements MemberOfData {
  public readonly id: EntityId;
  public readonly component: ComponentConstructor;
  public readonly property: string;
  constructor(data: MemberOfData) {
    super();
    Object.assign(this, data);
  }
}
