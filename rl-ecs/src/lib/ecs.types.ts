import { DamageType } from './systems.types';

export interface DamageResisted {
  type: DamageType;
  resistedAmount: number;
}

export type Logger = (msg: string) => void;
