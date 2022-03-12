import { Component } from 'rad-ecs';
export interface DefenseSkillData {
  count: number;
}
export class DefenseSkill extends Component implements DefenseSkillData {
  public readonly count: number;
  constructor(data: DefenseSkillData) {
    super();
    Object.assign(this, data);
  }
}

export interface DefenseSkillDeltaData {
  change: number;
}
export class DefenseSkillDelta extends Component implements DefenseSkillDeltaData {
  public readonly change: number;
  constructor(data: DefenseSkillDeltaData) {
    super();
    Object.assign(this, data);
  }
}
