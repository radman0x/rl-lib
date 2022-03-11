import { Leverage } from '@rad/rl-ecs';
import { RemoveSelfCondition, RemoveSelfConditionData } from './remove-self-condition.model';

export class LeverageRemove extends RemoveSelfCondition implements RemoveSelfConditionData {
  public readonly;
  constructor() {
    super({
      componentType: Leverage,
      property: 'power',
      minimum: 1,
    });
  }
}
