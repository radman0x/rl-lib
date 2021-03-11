import { Component } from 'rad-ecs';
import { Lighting } from './light-level.model';
export interface LightPreferenceData {
  threshold: Lighting;
  multiplier: number;
  strength: number;
}
export class LightPreference extends Component implements LightPreferenceData {
  public readonly threshold: Lighting;
  public readonly multiplier: number;
  public readonly strength: number;
  constructor(data: LightPreferenceData) {
    super();
    Object.assign(this, data);
  }
}
