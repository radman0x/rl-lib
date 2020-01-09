import { Component } from 'rad-ecs';

export enum LockState {
  LOCKED,
  UNLOCKED
}

export function oppositeLockState(s: LockState) {
  switch (s) {
    case LockState.LOCKED:
      return LockState.UNLOCKED;
    case LockState.UNLOCKED:
      return LockState.LOCKED;
    default:
      throw Error(`Unrecognised lock state: ${s} in switch!`);
  }
}
export interface StateImages {
  [k: string]: string;
}
export interface LockData {
  state: LockState;
  lockId: string;
  stateImages: StateImages;
}
export class Lock extends Component {
  public readonly state: LockState;
  public readonly lockId: string;
  public readonly stateImages: StateImages;
  constructor(data: LockData) {
    super();
    Object.assign(this, data);
  }
}
