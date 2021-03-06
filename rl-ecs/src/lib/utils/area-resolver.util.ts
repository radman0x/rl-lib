import { EntityManager } from 'rad-ecs';
import { GridPos } from '../..';

export type AreaBuilder = (em: EntityManager) => void;

export interface Builders {
  [areaId: string]: AreaBuilder;
}

export class AreaResolver {
  private loadedAreas: string[] = [];
  constructor(private areaBuilders: Builders = {}) {}

  load(areaId: string, em: EntityManager): boolean {
    if (!(areaId in this.areaBuilders)) {
      throw Error(`Area requested: ${areaId} doesn't exist!`);
    }
    if (!this.loadedAreas.find((e) => e === areaId)) {
      em.indexBy(GridPos);
      console.log(`Building new area: ${areaId}`);
      this.areaBuilders[areaId](em);
      this.loadedAreas.push(areaId);
      return true;
    }
    return false;
  }

  setBuilder(areaId: string, builder: AreaBuilder) {
    this.areaBuilders[areaId] = builder;
  }

  hasArea(areaId: string) {
    return areaId in this.areaBuilders;
  }
}
