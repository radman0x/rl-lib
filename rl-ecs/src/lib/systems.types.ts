import { CompassDirection } from '@rad/rl-utils';
import { DamageData } from './components/damage.model';
import { LockState } from './components/lock.model';
import { GridPosData } from './components/position.model';
import { EntityId } from './ecs.types';

export enum EffectType {
  FIRE,
  SLEEP,
  COLD
}

export interface ProtagonistEntity {
  protagId: EntityId;
}

export interface TargetPos {
  targetPos: GridPosData;
}

export interface EffectFromItem {
  itemId: EntityId;
  effectId: EntityId;
}

export interface ActiveEffect {
  effectId: EntityId;
}

export interface TargetEntity {
  targetId: EntityId;
}

export interface Damaged {
  damage?: DamageData;
}

export interface Teleported {
  teleport?: { targetLocation: GridPosData };
}

export interface EffectStart {
  effectId: EntityId;
  selectedPos?: GridPosData;
  selectedDirection?: CompassDirection;
}

export interface EffectStartSelectedPos {
  effectId: EntityId;
  selectedPos: GridPosData;
  selectedDirection?: CompassDirection;
}

export interface EffectStartedDirection {
  effectId: EntityId;
  selectedPos?: GridPosData;
  selectedDirection: CompassDirection;
}

export interface CombatTarget {
  combatTargetId: EntityId;
}

export interface EnteredPos {
  enteredPos: GridPosData;
}

export interface Collected {
  collectedId: EntityId;
}

export interface LockChange {
  lockChange?: {
    lockId?: string;
  };
}
