import { GridPos } from './components/position.model';
import { EffectType } from './systems/systems.types';

export type EntityId = number;

export enum CompassDirection {
  N = 'North',
  NE = 'North-East',
  E = 'East',
  SE = 'South-East',
  S = 'South',
  SW = 'South-West',
  W = 'West',
  NW = 'North-West'
}

export const compassDirectionToUnitVector: Map<
  CompassDirection,
  GridPos
> = new Map([
  [CompassDirection.N, new GridPos({ x: 0, y: 1, z: 0 })],
  [CompassDirection.NE, new GridPos({ x: 1, y: 1, z: 0 })],
  [CompassDirection.E, new GridPos({ x: 1, y: 0, z: 0 })],
  [CompassDirection.SE, new GridPos({ x: 1, y: -1, z: 0 })],
  [CompassDirection.S, new GridPos({ x: 0, y: -1, z: 0 })],
  [CompassDirection.SW, new GridPos({ x: -1, y: -1, z: 0 })],
  [CompassDirection.W, new GridPos({ x: -1, y: 0, z: 0 })],
  [CompassDirection.NW, new GridPos({ x: -1, y: 1, z: 0 })]
]);

export interface DamageResisted {
  type: EffectType;
  resistedAmount: number;
}
