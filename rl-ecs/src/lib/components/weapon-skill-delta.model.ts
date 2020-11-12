import { Component } from 'rad-ecs';
export interface WeaponSkillDeltaData {
  change: number;
}
export class WeaponSkillDelta extends Component
  implements WeaponSkillDeltaData {
  public readonly change: number;
  constructor(data: WeaponSkillDeltaData) {
    super();
    Object.assign(this, data);
  }
}
