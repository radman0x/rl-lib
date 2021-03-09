import { Component } from 'rad-ecs';

export interface LightSourceData {
  strength: [number, number, number];
}

export enum LightStrength {
  EXTRA_STRONG,
  STRONG,
  MEDIUM,
  WEAK,
  VERY_WEAK,
}

export function getLightStrength(s: LightStrength): [number, number, number] {
  switch (s) {
    case LightStrength.EXTRA_STRONG:
      return [255, 255, 255];
    case LightStrength.STRONG:
      return [170, 170, 170];
    case LightStrength.MEDIUM:
      return [140, 140, 140];
    case LightStrength.WEAK:
      return [130, 130, 130];
    case LightStrength.VERY_WEAK:
      return [100, 100, 100];
    default:
      throw Error(`Unhandled case in switch!`);
  }
}

export class LightSource extends Component implements LightSourceData {
  public readonly strength: [number, number, number];
  constructor(data: LightSourceData) {
    super();
    Object.assign(this, data);
  }
}
