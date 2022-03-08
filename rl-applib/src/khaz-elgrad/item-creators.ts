import { Description, Iron, Physical, Renderable, Size } from '@rad/rl-ecs';
import { RemoveSelfCondition } from 'libs/rl-ecs/src/lib/components/remove-self-condition.model';
import { EntityParts } from '..';

export function createIronOre(): EntityParts {
  return {
    entity: [
      new Renderable({
        image: 'Money-21.png',
        uiImage: 'assets/interface/Money-21.png',
        zOrder: 1,
      }),
      new Physical({ size: Size.SMALL }),
      new Iron({ count: 1 }),
      new Description({ short: 'iron ore', typeId: 'iron-ore' }),
      new RemoveSelfCondition({
        componentType: 'Iron',
        minimum: 1,
        property: 'count',
      }),
    ],
  };
}

// export function createBeetleScales(): EntityParts {
//   return {
//     entity: [
//       new Renderable({
//         image: 'Money-21.png',
//         uiImage: 'assets/interface/Money-21.png',
//         zOrder: 1,
//       }),
//       new Physical({ size: Size.SMALL }),
//       new Description({ short: 'beetle scales', typeId: 'beetle-scales' }),
//       new RemoveSelfCondition({
//         componentType: 'Iron',
//         minimum: 1,
//         property: 'count',
//       }),
//     ],
//   };
// }
