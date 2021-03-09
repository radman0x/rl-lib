import { Component } from 'rad-ecs';

export enum Lighting {
  PITCH_BLACK = 1,
  BLACK,
  DARK,
  DIM,
  NORMAL,
  WELL_LIT,
  BRIGHT,
  ULTRA_BRIGHT,
}

export function convertToLightLevel(rgb: [number, number, number]) {
  const total = rgb.reduce((acc, curr) => acc + curr, 0);
  if (total >= 700) {
    return Lighting.ULTRA_BRIGHT;
  } else if (total >= 625) {
    return Lighting.BRIGHT;
  } else if (total >= 550) {
    return Lighting.WELL_LIT;
  } else if (total >= 475) {
    return Lighting.NORMAL;
  } else if (total >= 400) {
    return Lighting.DIM;
  } else if (total >= 325) {
    return Lighting.DARK;
  } else if (total >= 250) {
    return Lighting.BLACK;
  } else {
    return Lighting.PITCH_BLACK;
  }
}

export const LEVEL_INDEX = {
  [Lighting.ULTRA_BRIGHT]: 0xffffff,
  [Lighting.BRIGHT]: 0xdddddd,
  [Lighting.WELL_LIT]: 0xbbbbbb,
  [Lighting.NORMAL]: 0x999999,
  [Lighting.DIM]: 0x777777,
  [Lighting.DARK]: 0x555555,
  [Lighting.BLACK]: 0x333333,
  [Lighting.PITCH_BLACK]: 0x111111,
};
export interface LightLevelData {
  level: Lighting;
  raw: [number, number, number];
}

export class LightLevel extends Component implements LightLevelData {
  public readonly level: Lighting;
  public readonly raw: [number, number, number];
  constructor(data: LightLevelData) {
    super();
    Object.assign(this, data);
  }
}
