import { AdjacencyStringIndex } from '@rad/rl-utils';
import { Component } from 'rad-ecs';
export interface NeighbourDisplayAffectedData {
  typeId: string;
  adjacencyImageMap: AdjacencyStringIndex<{ image: string; uiImage?: string }>;
}
export class NeighbourDisplayAffected extends Component implements NeighbourDisplayAffectedData {
  public readonly typeId: string;
  public readonly adjacencyImageMap: AdjacencyStringIndex<{ image: string; uiImage?: string }>;

  constructor(data: NeighbourDisplayAffectedData) {
    super();
    Object.assign(this, data);
  }
}
