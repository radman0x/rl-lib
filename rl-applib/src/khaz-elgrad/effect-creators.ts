import { TargetOrigin, Heal, Usable, Description, EnergyCost } from '@rad/rl-ecs';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { EntityParts } from '..';

export function createSingleUseSelfHealingEffect({
  useName,
  amount,
  description,
}: {
  useName: string;
  amount: number;
  description: string;
}): EntityParts {
  return {
    entity: [
      new SingleTarget({}),
      new TargetOrigin({}),
      new Heal({ amount }),
      new Usable({ useName }),
      new Description({
        short: description,
      }),
      new EnergyCost({ amount: 1 }),
    ],
  };
}
