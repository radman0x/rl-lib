import { DamageType } from './systems.types';

export type EntityId = number;

export interface DamageResisted {
  type: DamageType;
  resistedAmount: number;
}

export type Logger = (msg: string) => void;
