import { Component, EntityId } from 'rad-ecs';

export class Recipes extends Component {
  public readonly contents: EntityId[];
  constructor(data: { contents: EntityId[] }) {
    super();
    Object.assign(this, data);
  }
}
