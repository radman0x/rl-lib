import { Component } from 'rad-ecs';

export class Combat extends Component {

  public readonly damage: number

  constructor(data: {damage: number}) {
    super();
    this.damage = data.damage;
  }
}
