import { Consumable } from '@rad/rl-ecs';
import { RemoveSelfCondition, RemoveSelfConditionData } from './remove-self-condition.model';

export class ConsumableRemove extends RemoveSelfCondition implements RemoveSelfConditionData {
  public readonly;
  constructor() {
    super({
      componentType: Consumable,
      property: 'uses',
      minimum: 1,
    });
  }
}
