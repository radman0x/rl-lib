import { Description, IronCost, Renderable, TargetOrigin } from '@rad/rl-ecs';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
import { SpawnEntity } from 'libs/rl-ecs/src/lib/components/spawn-entity';
import { EntityManager } from 'rad-ecs';
import { createGameEntity, createPickAxe, EntityParts } from '..';

export function createPickAxeRecipe(em: EntityManager): EntityParts {
  const pickAxe = createGameEntity(em, createPickAxe());
  return {
    entity: [
      new Renderable({
        image: 'ShortWep-11.png',
        zOrder: 1,
        uiImage: 'assets/interface/ShortWep-11.png',
      }),
      new Description({ short: 'a pick-axe' }),
      new IronCost({ amount: 2 }),
      new SpawnEntity({ entities: [pickAxe], replaceExisting: false }),
      new TargetOrigin({}),
      new SingleTarget(),
    ],
  };
}
