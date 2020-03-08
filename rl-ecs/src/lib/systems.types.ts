import { CompassDirection } from '@rad/rl-utils';
import { DamageData } from './components/damage.model';
import { LockState } from './components/lock.model';
import { GridPosData } from './components/position.model';
import { EntityId } from './ecs.types';
import { Entity } from 'rad-ecs';

export enum DamageType {
  FIRE,
  SLEEP,
  COLD,
  PHYSICAL
}

export interface ProtagonistEntity {
  protagId: EntityId;
}

export interface NoteworthyEntity {
  noteworthyId: EntityId;
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

export interface StrikeResult {
  strikeSuccess: boolean;
}

export interface WoundResult {
  woundSuccess: boolean;
}

export interface WoundsInflicted {
  woundsInflicted: number;
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

export type CombatResult = ProtagonistEntity &
  CombatTarget &
  StrikeResult &
  Partial<WoundResult> &
  Partial<WoundsInflicted>;

export interface ReapedEntity {
  reapedEntity: Entity;
}
