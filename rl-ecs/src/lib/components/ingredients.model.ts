import { ComponentCost } from '@rad/rl-ecs';
import { Component } from 'rad-ecs';
import { RemoveSelfCondition, RemoveSelfConditionData } from './remove-self-condition.model';
export interface SlimeData {
  count: number;
}

export class Slime extends Component implements SlimeData {
  public readonly count: number;
  constructor(data: SlimeData) {
    super();
    Object.assign(this, data);
  }
}

export class SlimeCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: Slime,
      property: 'count',
      consume: true,
      name: 'Slime',
    });
  }
}

export class SlimeRemove extends RemoveSelfCondition implements RemoveSelfConditionData {
  public readonly;
  constructor() {
    super({
      componentType: Slime,
      property: 'count',
      minimum: 1,
    });
  }
}

export interface FleshySackData {
  count: number;
}
export class FleshySack extends Component implements FleshySackData {
  public readonly count: number;
  constructor(data: FleshySackData) {
    super();
    Object.assign(this, data);
  }
}

export class FleshySackCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: FleshySack,
      property: 'count',
      consume: true,
      name: 'Fleshy Sack',
    });
  }
}

export class FleshySackRemove extends RemoveSelfCondition implements RemoveSelfConditionData {
  public readonly;
  constructor() {
    super({
      componentType: FleshySack,
      property: 'count',
      minimum: 1,
    });
  }
}

export interface BrightOreData {
  count: number;
}
export class BrightOre extends Component implements BrightOreData {
  public readonly count: number;
  constructor(data: BrightOreData) {
    super();
    Object.assign(this, data);
  }
}

export class BrightOreCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: BrightOre,
      property: 'count',
      consume: true,
      name: 'Bright ore',
    });
  }
}

export class BrightOreRemove extends RemoveSelfCondition implements RemoveSelfConditionData {
  public readonly;
  constructor() {
    super({
      componentType: BrightOre,
      property: 'count',
      minimum: 1,
    });
  }
}

export interface MithrilOreData {
  count: number;
}
export class MithrilOre extends Component implements MithrilOreData {
  public readonly count: number;
  constructor(data: MithrilOreData) {
    super();
    Object.assign(this, data);
  }
}

export class MithrilOreCost extends ComponentCost {
  constructor(data: { amount: number }) {
    super({
      amount: data.amount,
      componentType: MithrilOre,
      property: 'count',
      consume: true,
      name: 'Mithril ore',
    });
  }
}

export class MithrilOreRemove extends RemoveSelfCondition implements RemoveSelfConditionData {
  public readonly;
  constructor() {
    super({
      componentType: MithrilOre,
      property: 'count',
      minimum: 1,
    });
  }
}
