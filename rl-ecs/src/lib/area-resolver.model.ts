import { popRandomElement } from '@rad/rl-utils';
import { EntityData, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { Climbable, Effects, GridPos, Physical, Renderable, Size } from '..';
import { allComponentIndex } from './component-utils.model';
import { AreaIngress } from './components/area-ingress';
import { AreaTransition } from './components/area-transition.model';
import { radClone } from './systems.utils';

export type AreaBuilder = (em: EntityManager) => void;

const BLOCKED = 1;
const OPEN = 0;

export class AreaResolver {
  private areaBuilders: {
    [areaId: string]: AreaBuilder;
  } = {};
  private savedAreas: {
    [areaId: string]: EntityData;
  } = {};
  private currentAreaId: string | null = null;

  constructor() {
    this.areaBuilders['secondLevel'] = (em: EntityManager) =>
      this.hardcodeBuilder(em);
  }

  load(areaId: string, em: EntityManager) {
    if (areaId in this.savedAreas) {
      return;
      // radNOTE: temporarily removed, this could be added back in if the game needs to be optimised in the future
      // console.log(`Loading saved area: ${areaId}`);
      // em.import(
      //   { indexed: ['GridPos'], entities: this.savedAreas[areaId] },
      //   allComponentIndex()
      // );
    } else if (areaId in this.areaBuilders) {
      em.indexBy(GridPos);
      console.log(`Building new area: ${areaId}`);
      this.areaBuilders[areaId](em);
    } else {
      throw Error(`Area requested: ${areaId} doesn't exist!`);
    }
    this.currentAreaId = areaId;
  }

  setSaved(areaId: string, area: EntityData) {
    console.log(`setting saved area: ${areaId}`);
    this.savedAreas[areaId] = radClone(area);
  }

  setBuilder(areaId: string, builder: AreaBuilder) {
    this.areaBuilders[areaId] = builder;
  }

  currentArea(areaId?: string): string {
    if (areaId) {
      this.currentAreaId = areaId;
    }
    return this.currentAreaId;
  }

  hardcodeBuilder(em: EntityManager) {
    const world = new ROT.Map.Uniform(38, 10, {
      roomDugPercentage: 0.9
    });
    world.create((x: number, y: number, contents: number) => {
      if (contents === BLOCKED) {
        em.create(
          new Renderable({ image: 'Wall-110.png', zOrder: 1 }),
          new GridPos({ x, y, z: -1 }),
          new Physical({ size: Size.FILL })
        );
      } else if (contents === OPEN) {
        em.create(
          new Renderable({ image: 'Floor-144.png', zOrder: 1 }),
          new GridPos({ x, y, z: -2 }),
          new Physical({ size: Size.FILL })
        );
      }
    });

    let rooms = world.getRooms();
    let playerRoom = popRandomElement(rooms);
    let startPos = new GridPos({
      x: playerRoom.getCenter()[0],
      y: playerRoom.getCenter()[1],
      z: -1
    });
    em.create(
      startPos,
      new AreaIngress({ label: 'entry1' }),
      new Renderable({ image: 'Tile-12.png', zOrder: 0 }),
      new Effects({
        contents: [
          em.create(
            new Climbable(),
            new AreaTransition({
              areaId: 'firstLevel',
              ingressLabel: 'entry1'
            })
          ).id
        ]
      })
    );
  }
}
