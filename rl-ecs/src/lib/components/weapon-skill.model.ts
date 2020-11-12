import { Component } from 'rad-ecs';
export interface WeaponSkillData {
  count: number;
}
export class WeaponSkill extends Component implements WeaponSkillData {
  public readonly count: number;
  constructor(data: WeaponSkillData) {
    super();
    Object.assign(this, data);
  }
}
