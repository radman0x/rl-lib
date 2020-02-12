import { EffectType } from './systems.types';

export type EntityId = number;

export interface DamageResisted {
  type: EffectType;
  resistedAmount: number;
}

export type Logger = (msg: string) => void;
