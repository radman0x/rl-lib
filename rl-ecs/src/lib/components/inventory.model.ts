import { EntityId } from '../ecs.types';
import { Component } from 'rad-ecs';

export class Inventory extends Component {
  public readonly contents: EntityId[];
  constructor(data: { contents: EntityId[] }) {
    super();
    Object.assign(this, data);
  }
}
