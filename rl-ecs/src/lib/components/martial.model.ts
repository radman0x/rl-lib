import { Component } from 'rad-ecs';
export interface MartialData {
  weaponSkill: number;
  strength: number;
  toughness: number;
}
export class Martial extends Component implements MartialData {
  public readonly weaponSkill: number;
  public readonly strength: number;
  public readonly toughness: number;
  constructor(data: MartialData) {
    super();
    Object.assign(this, data);
  }
}
