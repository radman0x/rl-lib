import { GridPos } from './components/position.model';
import { EffectType } from './systems/systems.types';
import { Hashable } from 'rad-ecs/dist/hashtable';

export type EntityId = number;

export interface DamageResisted {
  type: EffectType;
  resistedAmount: number;
}

export type Logger = (msg: string) => void;
