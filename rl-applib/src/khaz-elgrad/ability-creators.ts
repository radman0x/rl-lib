import {
  Animation,
  Bang,
  Description,
  ManaCost,
  Push,
  Renderable,
  Targeted,
  Usable,
} from '@rad/rl-ecs';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { EntityParts } from '..';

export function createShoveAbility(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Effect0-133.png',
        uiImage: 'assets/interface/Effect0-133.png',
        zOrder: 1,
      }),
      new Description({ short: 'shove' }),
      new Targeted({ range: 1 }),
      new Animation({ name: 'Effect-135', speed: 0.3, scale: 1 }),
      new Usable({ useName: 'throw' }),
      new SingleTarget(),
      new ManaCost({ amount: 5 }),
      new Description({ short: 'push' }),
      new Push({ strength: 4 }),
    ],
  };
}
