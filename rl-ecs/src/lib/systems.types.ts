import { CompassDirection } from '@rad/rl-utils';
import { EntityId } from 'rad-ecs';
import { AreaTransitionData } from './components/area-transition.model';
import { DamageData } from './components/damage.model';
import { EndType } from './components/end-state.model';
import { GridPosData } from './components/position.model';

export enum DamageType {
  FIRE,
  SLEEP,
  COLD,
  PHYSICAL,
  MAGICAL,
}

export interface ProtagonistEntity {
  protagId: EntityId;
}

export interface MovingEntity {
  movingId: EntityId | null;
}

export interface DamageTargetEntity {
  damageTargetId: EntityId;
}

export interface NoteworthyEntity {
  noteworthyId: EntityId;
}

export interface TargetPos {
  targetPos: GridPosData | null;
}

export interface CanStand {
  canStand: boolean;
}

export interface CanOccupy {
  canOccupy: boolean;
}

export interface IsBlocked {
  isBlocked: boolean;
}

export interface EffectFromItem {
  itemId: EntityId;
  effectId: EntityId;
}

export interface ActiveEffect {
  effectId: EntityId;
}

export interface TargetEntity {
  targetId: EntityId | null;
}

export interface EffectTarget {
  effectTargetId: EntityId | null;
}

export interface Damaged {
  damage: DamageData | null;
}

export interface StrikeResult {
  strikeSuccess: boolean | null;
}

export interface WoundResult {
  woundSuccess: boolean | null;
}

export interface ArmorSaveResult {
  armorSaveSuccess: boolean | null;
}

export interface WoundsInflicted {
  woundsInflicted: number | null;
}

export interface ActiveEffectDescription {
  activeEffectDescription: string | null;
}

export type WorldStateChangeReport = WorldStateChangeDescription & WorldStateChanged;

export interface WorldStateChangeDescription {
  worldStateChangeDescription: string | null;
}

export interface WorldStateChanged {
  worldStateChanged: boolean;
}

export interface TeleportDetails {
  targetLocation: GridPosData;
}
export interface Teleported {
  teleport: TeleportDetails | null;
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

export interface CombatTargetEntity {
  combatTargetId: EntityId | null;
}

export interface EnteredPos {
  enteredPos: GridPosData;
}

export interface Collected {
  collectedId: EntityId;
}

export interface LockChangeDetails {
  lockId?: string;
}
export interface LockChange {
  lockChange: LockChangeDetails | null;
}

export interface NewPosition {
  newPosition: GridPosData | null;
}

export type CombatResult = ProtagonistEntity &
  CombatTargetEntity &
  StrikeResult &
  WoundResult &
  Damaged;

export interface ReapedEntity {
  reapedId: EntityId | null;
}

export interface DistanceTo {
  distance: {
    pos: GridPosData;
    travelTime: number;
  };
}

export interface SpatialOrder {
  movingId: EntityId;
  newPos: GridPosData;
}
export interface SpatialChange {
  spatial: SpatialOrder | null;
}

export interface TransitionToArea {
  areaTransition: AreaTransitionData | null;
}

export interface ActiveAgent {
  agentId: EntityId | null;
}

export interface LocusEntity {
  locusId: EntityId | null;
}

export interface DistanceMaps {
  distanceMaps: EntityId[] | null;
}

export interface OrderScore {
  score: number | null;
}

export interface AggressorEntity {
  aggressorId: EntityId | null;
}

export type MoveDetails = NewPosition & MovingEntity;

export interface AttackOrder {
  combatTargetId: EntityId;
  aggressorId: EntityId;
  strikeSuccess: boolean;
  woundSuccess: boolean;
  armorSaveSuccess: boolean;
  damage: DamageData | null;
  damageTargetId: EntityId | null;
  reapedId: EntityId | null;
}

export interface MoveOrder {
  newPosition: GridPosData;
  movingId: EntityId;
}

export interface Order {
  agentId: EntityId | null;
  score: number | null;
  orderDescription: string;
  move: MoveOrder | null;
  attack: AttackOrder | null;
}

export interface SpatialReport {
  spatialReport: { spatialId: EntityId; newPos: GridPosData } | null;
}

export interface GameEnded {
  endType: EndType | null;
}

export interface EntityRemovalDetails {
  removeId: EntityId;
  doRemove: boolean;
}
export interface EntityRemoval {
  entityRemoval: EntityRemovalDetails | null;
}

export interface StunDetails {
  duration: number;
}

export interface Stun {
  stun: StunDetails | null;
}

export interface SpawnedEffect {
  effectId: EntityId;
  effectTargetId: EntityId | null;
  targetPos: GridPosData | null;
  effectOrigin: GridPosData | null;
}

export interface ChangeReport {
  [change: string]: {
    activeEffectDescription: string;
    effectModificationDescription?: string;
    worldStateChangeDescription?: string;
    spawnedEffects?: SpawnedEffect[];
  };
}
export interface EffectReport {
  effectReport: ChangeReport | null;
}

export interface AppliedForceDetails {
  magnitude: number;
  direction: CompassDirection;
}

export interface AppliedForce {
  force: AppliedForceDetails | null;
}

export interface EnergyDeltaDetails {
  amount: number;
}

export interface EnergyDelta {
  energyDelta: EnergyDeltaDetails | null;
}

export interface ProcessConsequence {
  consequenceId: EntityId;
}

export interface Payer {
  payerId: EntityId;
}
export interface CostPaid {
  costPaid: boolean | null;
}

export interface EffectOrigin {
  effectOrigin: GridPosData | null;
}

export interface CreateEntity {
  entities: EntityId[];
  replaceExisting: boolean;
}

export interface Messages {
  messages: string[];
}
