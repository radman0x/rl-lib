import { Component, EntityId } from 'rad-ecs';
import { GridPos } from './position.model';

import { ValueMap } from '@rad/rl-utils';

export enum KnownState {
  UNKNOWN,
  CURRENT,
  REMEMBERED
}

export type KnowledgeMap = ValueMap<GridPos, EntityId[]>;
export interface KnowledgeData {
  current: KnowledgeMap;
  history: KnowledgeMap;
}

export class Knowledge extends Component {
  public readonly current: KnowledgeMap;
  public readonly history: KnowledgeMap;

  constructor(data: KnowledgeData) {
    super();
    Object.assign(this, data);
  }
}
