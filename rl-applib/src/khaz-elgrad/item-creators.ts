import {
  Description,
  Heal,
  Iron,
  OnlySpecific,
  Physical,
  Renderable,
  Size,
  Stone,
  Targeted,
  Usable,
} from '@rad/rl-ecs';
import { RemoveSelfCondition } from 'libs/rl-ecs/src/lib/components/remove-self-condition.model';
import { SingleTarget } from 'libs/rl-ecs/src/lib/components/single-target.model';
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
        componentType: Iron,
        minimum: 1,
        property: 'count',
      }),
    ],
  };
}

export function createPickAxe(): EntityParts {
  return {
    entity: [
      new Physical({ size: Size.SMALL }),
      new Renderable({
        image: 'ShortWep-16.png',
        zOrder: 5,
        uiImage: `assets/interface/ShortWep-16.png`,
      }),
      new Description({
        short: `pick-axe`,
      }),
    ],
    effects: [
      {
        entity: [
          new OnlySpecific({
            componentType: Stone,
          }),
          new SingleTarget({}),
          new Targeted({ range: 1 }),
          new Heal({ amount: -10 }),
          new Usable({ useName: 'excavate' }),
          new Description({
            short: `excavates`,
          }),
        ],
      },
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
