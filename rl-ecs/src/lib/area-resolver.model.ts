import { EntityData, EntityManager } from 'rad-ecs';
import { GridPos } from '..';
import { radClone } from './systems.utils';

export type AreaBuilder = (em: EntityManager) => void;

export class AreaResolver {
  private areaBuilders: {
    [areaId: string]: AreaBuilder;
  } = {};
  private savedAreas: {
    [areaId: string]: EntityData;
  } = {};
  private currentAreaId: string | null = null;

  constructor() {}

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
}
