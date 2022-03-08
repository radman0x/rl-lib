import {
  GridPos,
  Renderable,
  Physical,
  Size,
  Effects,
  Climbable,
  EndState,
  EndType,
} from '@rad/rl-ecs';
import { Fixed } from 'libs/rl-ecs/src/lib/components/fixed.model';
import { EntityParts } from '..';

// export function createStrongholdAnvil(): EntityParts {}

export function createEndGameStairs(): EntityParts {
  return {
    entity: [
      new Renderable({ image: 'Tile-12.png', zOrder: 1 }),
      new Physical({ size: Size.MEDIUM }),
      new Fixed({}),
    ],
    effects: [{ entity: [new Climbable(), new EndState({ endType: EndType.VICTORY })] }],
  };
}
