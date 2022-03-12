import { AdjacencyStringIndex } from '@rad/rl-utils';
import { Component } from 'rad-ecs';
export interface NeighbourDisplayAffectedData {
  typeId: string;
  adjacencyImageMap: AdjacencyStringIndex<{ image: string; image2?: string; uiImage?: string }>;
  pruneCardinalWhenSurrounded: boolean;
  zOrder?: number;
}
export class NeighbourDisplayAffected extends Component implements NeighbourDisplayAffectedData {
  public readonly typeId: string;
  public readonly adjacencyImageMap: AdjacencyStringIndex<{
    image: string;
    image2?: string;
    uiImage?: string;
  }>;
  public readonly pruneCardinalWhenSurrounded: boolean;
  public readonly zOrder?: number;

  constructor(data: NeighbourDisplayAffectedData) {
    super();
    Object.assign(this, data);
  }
}

export function createMithrilOreNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    zOrder: 5,
    adjacencyImageMap: {
      NONE: { image: 'Mithril-Ore0-S.png', image2: 'Mithril-Ore1-S.png' },
      N: { image: 'Mithril-Ore0-S.png', image2: 'Mithril-Ore1-S.png' },
      E: { image: 'Mithril-Ore0-S.png', image2: 'Mithril-Ore1-S.png' },
      S: { image: 'Mithril-Ore0-W_E.png', image2: 'Mithril-Ore1-W_E.png' },
      W: { image: 'Mithril-Ore0-S.png', image2: 'Mithril-Ore1-S.png' },
      N_E: { image: 'Mithril-Ore0-W.png', image2: 'Mithril-Ore1-W.png' },
      S_N_E: { image: 'Mithril-Ore0-W.png', image2: 'Mithril-Ore1-W.png' },
      S_E: { image: 'Mithril-Ore0-W.png', image2: 'Mithril-Ore1-W.png' },
      S_N: { image: 'Mithril-Ore0-W_E.png', image2: 'Mithril-Ore1-W_E.png' },
      W_E: { image: 'Mithril-Ore0-S.png', image2: 'Mithril-Ore1-S.png' },
      W_N: { image: 'Mithril-Ore0-E.png', image2: 'Mithril-Ore1-E.png' },
      W_N_E: { image: 'Mithril-Ore0-S.png', image2: 'Mithril-Ore1-S.png' },
      W_S: { image: 'Mithril-Ore0-E.png', image2: 'Mithril-Ore1-E.png' },
      W_S_E: { image: 'Mithril-Ore0-EMPTY.png' },
      W_S_N: { image: 'Mithril-Ore0-E.png', image2: 'Mithril-Ore1-E.png' },
      W_S_N_E: { image: 'Mithril-Ore0-EMPTY.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}

export function createBrightOreNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    zOrder: 5,
    adjacencyImageMap: {
      NONE: { image: 'Bright-Ore0-S.png', image2: 'Bright-Ore1-S.png' },
      N: { image: 'Bright-Ore0-S.png', image2: 'Bright-Ore1-S.png' },
      E: { image: 'Bright-Ore0-S.png', image2: 'Bright-Ore1-S.png' },
      S: { image: 'Bright-Ore0-W_E.png', image2: 'Bright-Ore1-W_E.png' },
      W: { image: 'Bright-Ore0-S.png', image2: 'Bright-Ore1-S.png' },
      N_E: { image: 'Bright-Ore0-W.png', image2: 'Bright-Ore1-W.png' },
      S_N_E: { image: 'Bright-Ore0-W.png', image2: 'Bright-Ore1-W.png' },
      S_E: { image: 'Bright-Ore0-W.png', image2: 'Bright-Ore1-W.png' },
      S_N: { image: 'Bright-Ore0-W_E.png', image2: 'Bright-Ore1-W_E.png' },
      W_E: { image: 'Bright-Ore0-S.png', image2: 'Bright-Ore1-S.png' },
      W_N: { image: 'Bright-Ore0-E.png', image2: 'Bright-Ore1-E.png' },
      W_N_E: { image: 'Bright-Ore0-S.png', image2: 'Bright-Ore1-S.png' },
      W_S: { image: 'Bright-Ore0-E.png', image2: 'Bright-Ore1-E.png' },
      W_S_E: { image: 'Bright-Ore0-EMPTY.png' },
      W_S_N: { image: 'Bright-Ore0-E.png', image2: 'Bright-Ore1-E.png' },
      W_S_N_E: { image: 'Bright-Ore0-EMPTY.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}

export function createBlackOreNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    zOrder: 5,
    adjacencyImageMap: {
      NONE: { image: 'Black-Ore0-S.png', image2: 'Black-Ore1-S.png' },
      N: { image: 'Black-Ore0-S.png', image2: 'Black-Ore1-S.png' },
      E: { image: 'Black-Ore0-S.png', image2: 'Black-Ore1-S.png' },
      S: { image: 'Black-Ore0-W_E.png', image2: 'Black-Ore1-W_E.png' },
      W: { image: 'Black-Ore0-S.png', image2: 'Black-Ore1-S.png' },
      N_E: { image: 'Black-Ore0-W.png', image2: 'Black-Ore1-W.png' },
      S_N_E: { image: 'Black-Ore0-W.png', image2: 'Black-Ore1-W.png' },
      S_E: { image: 'Black-Ore0-W.png', image2: 'Black-Ore1-W.png' },
      S_N: { image: 'Black-Ore0-W_E.png', image2: 'Black-Ore1-W_E.png' },
      W_E: { image: 'Black-Ore0-S.png', image2: 'Black-Ore1-S.png' },
      W_N: { image: 'Black-Ore0-E.png', image2: 'Black-Ore1-E.png' },
      W_N_E: { image: 'Black-Ore0-S.png', image2: 'Black-Ore1-S.png' },
      W_S: { image: 'Black-Ore0-E.png', image2: 'Black-Ore1-E.png' },
      W_S_E: { image: 'Black-Ore0-EMPTY.png' },
      W_S_N: { image: 'Black-Ore0-E.png', image2: 'Black-Ore1-E.png' },
      W_S_N_E: { image: 'Black-Ore0-EMPTY.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}

export function createTileChasmNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Tile-Chasm-NONE.png' },
      N: { image: 'Tile-Chasm-N.png' },
      E: { image: 'Tile-Chasm-E.png' },
      S: { image: 'Tile-Chasm-S.png' },
      W: { image: 'Tile-Chasm-W.png' },
      N_E: { image: 'Tile-Chasm-S_N_E.png' },
      S_N_E: { image: 'Tile-Chasm-S_N_E.png' },
      S_E: { image: 'Tile-Chasm-S_E.png' },
      S_N: { image: 'Tile-Chasm-S_N_E.png' },
      W_E: { image: 'Tile-Chasm-W_E.png' },
      W_N: { image: 'Tile-Chasm-W_S_N.png' },
      W_N_E: { image: 'Tile-Chasm-W_N_E.png' },
      W_S: { image: 'Tile-Chasm-W_S.png' },
      W_S_E: { image: 'Tile-Chasm-W_S_E.png' },
      W_S_N: { image: 'Tile-Chasm-W_S_N.png' },
      W_S_N_E: { image: 'Tile-Chasm-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: false,
  });
}

export function createBlackVolcanicNDAComponent(typeId: string = 'black-volcanic') {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Black-Volcanic-NONE.png' },
      N: { image: 'Black-Volcanic-N.png' },
      E: { image: 'Black-Volcanic-E.png' },
      S: { image: 'Black-Volcanic-S.png' },
      W: { image: 'Black-Volcanic-W.png' },
      N_E: { image: 'Black-Volcanic-N_E.png' },
      S_N_E: { image: 'Black-Volcanic-S_N_E.png' },
      S_E: { image: 'Black-Volcanic-S_E.png' },
      S_N: { image: 'Black-Volcanic-S_N.png' },
      W_E: { image: 'Black-Volcanic-W_E.png' },
      W_N: { image: 'Black-Volcanic-W_N.png' },
      W_N_E: { image: 'Black-Volcanic-W_N_E.png' },
      W_S: { image: 'Black-Volcanic-W_S.png' },
      W_S_E: { image: 'Black-Volcanic-W_S_E.png' },
      W_S_N: { image: 'Black-Volcanic-W_S_N.png' },
      W_S_N_E: { image: 'Black-Volcanic-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: false,
  });
}

export function createSilverTileNDAComponent(typeId: string = 'silver-tile') {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Silver-Tile-NONE.png' },
      N: { image: 'Silver-Tile-N.png' },
      E: { image: 'Silver-Tile-E.png' },
      S: { image: 'Silver-Tile-S.png' },
      W: { image: 'Silver-Tile-W.png' },
      N_E: { image: 'Silver-Tile-N_E.png' },
      S_N_E: { image: 'Silver-Tile-S_N_E.png' },
      S_E: { image: 'Silver-Tile-S_E.png' },
      S_N: { image: 'Silver-Tile-S_N.png' },
      W_E: { image: 'Silver-Tile-W_E.png' },
      W_N: { image: 'Silver-Tile-W_N.png' },
      W_N_E: { image: 'Silver-Tile-W_N_E.png' },
      W_S: { image: 'Silver-Tile-W_S.png' },
      W_S_E: { image: 'Silver-Tile-W_S_E.png' },
      W_S_N: { image: 'Silver-Tile-W_S_N.png' },
      W_S_N_E: { image: 'Silver-Tile-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: false,
  });
}

export function createDarkTileNDAComponent(typeId: string = 'dark-tile') {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Dark-Tile-NONE.png' },
      N: { image: 'Dark-Tile-N.png' },
      E: { image: 'Dark-Tile-E.png' },
      S: { image: 'Dark-Tile-S.png' },
      W: { image: 'Dark-Tile-W.png' },
      N_E: { image: 'Dark-Tile-N_E.png' },
      S_N_E: { image: 'Dark-Tile-S_N_E.png' },
      S_E: { image: 'Dark-Tile-S_E.png' },
      S_N: { image: 'Dark-Tile-S_N.png' },
      W_E: { image: 'Dark-Tile-W_E.png' },
      W_N: { image: 'Dark-Tile-W_N.png' },
      W_N_E: { image: 'Dark-Tile-W_N_E.png' },
      W_S: { image: 'Dark-Tile-W_S.png' },
      W_S_E: { image: 'Dark-Tile-W_S_E.png' },
      W_S_N: { image: 'Dark-Tile-W_S_N.png' },
      W_S_N_E: { image: 'Dark-Tile-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: false,
  });
}

export function createOrangeDirtNDAComponent(typeId: string = 'orange-dirt') {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Orange-Dirt-NONE.png' },
      N: { image: 'Orange-Dirt-N.png' },
      E: { image: 'Orange-Dirt-E.png' },
      S: { image: 'Orange-Dirt-S.png' },
      W: { image: 'Orange-Dirt-W.png' },
      N_E: { image: 'Orange-Dirt-N_E.png' },
      S_N_E: { image: 'Orange-Dirt-S_N_E.png' },
      S_E: { image: 'Orange-Dirt-S_E.png' },
      S_N: { image: 'Orange-Dirt-S_N.png' },
      W_E: { image: 'Orange-Dirt-W_E.png' },
      W_N: { image: 'Orange-Dirt-W_N.png' },
      W_N_E: { image: 'Orange-Dirt-W_N_E.png' },
      W_S: { image: 'Orange-Dirt-W_S.png' },
      W_S_E: { image: 'Orange-Dirt-W_S_E.png' },
      W_S_N: { image: 'Orange-Dirt-W_S_N.png' },
      W_S_N_E: { image: 'Orange-Dirt-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: false,
  });
}

export function createDimCaveNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Dim-Cave-NONE.png' },
      N: { image: 'Dim-Cave-N.png' },
      E: { image: 'Dim-Cave-W_E.png' },
      S: { image: 'Dim-Cave-S_N.png' },
      W: { image: 'Dim-Cave-W_E.png' },
      N_E: { image: 'Dim-Cave-N_E.png' },
      S_N_E: { image: 'Dim-Cave-S_N_E.png' },
      S_E: { image: 'Dim-Cave-S_E.png' },
      S_N: { image: 'Dim-Cave-S_N.png' },
      W_E: { image: 'Dim-Cave-W_E.png' },
      W_N: { image: 'Dim-Cave-W_N.png' },
      W_N_E: { image: 'Dim-Cave-W_N_E.png' },
      W_S: { image: 'Dim-Cave-W_S.png' },
      W_S_E: { image: 'Dim-Cave-W_S_E.png' },
      W_S_N: { image: 'Dim-Cave-W_S_N.png' },
      W_S_N_E: { image: 'Dim-Cave-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}

export function createBrightCaveNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Bright-Cave-NONE.png' },
      N: { image: 'Bright-Cave-N.png' },
      E: { image: 'Bright-Cave-W_E.png' },
      S: { image: 'Bright-Cave-S_N.png' },
      W: { image: 'Bright-Cave-W_E.png' },
      N_E: { image: 'Bright-Cave-N_E.png' },
      S_N_E: { image: 'Bright-Cave-S_N_E.png' },
      S_E: { image: 'Bright-Cave-S_E.png' },
      S_N: { image: 'Bright-Cave-S_N.png' },
      W_E: { image: 'Bright-Cave-W_E.png' },
      W_N: { image: 'Bright-Cave-W_N.png' },
      W_N_E: { image: 'Bright-Cave-W_N_E.png' },
      W_S: { image: 'Bright-Cave-W_S.png' },
      W_S_E: { image: 'Bright-Cave-W_S_E.png' },
      W_S_N: { image: 'Bright-Cave-W_S_N.png' },
      W_S_N_E: { image: 'Bright-Cave-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}
export function createDimMinesNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Dim-Mines-NONE.png' },
      N: { image: 'Dim-Mines-N.png' },
      E: { image: 'Dim-Mines-W_E.png' },
      S: { image: 'Dim-Mines-S_N.png' },
      W: { image: 'Dim-Mines-W_E.png' },
      N_E: { image: 'Dim-Mines-N_E.png' },
      S_N_E: { image: 'Dim-Mines-S_N_E.png' },
      S_E: { image: 'Dim-Mines-S_E.png' },
      S_N: { image: 'Dim-Mines-S_N.png' },
      W_E: { image: 'Dim-Mines-W_E.png' },
      W_N: { image: 'Dim-Mines-W_N.png' },
      W_N_E: { image: 'Dim-Mines-W_N_E.png' },
      W_S: { image: 'Dim-Mines-W_S.png' },
      W_S_E: { image: 'Dim-Mines-W_S_E.png' },
      W_S_N: { image: 'Dim-Mines-W_S_N.png' },
      W_S_N_E: { image: 'Dim-Mines-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}

export function createBrightMinesNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Bright-Mines-NONE.png' },
      N: { image: 'Bright-Mines-N.png' },
      E: { image: 'Bright-Mines-W_E.png' },
      S: { image: 'Bright-Mines-S_N.png' },
      W: { image: 'Bright-Mines-W_E.png' },
      N_E: { image: 'Bright-Mines-N_E.png' },
      S_N_E: { image: 'Bright-Mines-S_N_E.png' },
      S_E: { image: 'Bright-Mines-S_E.png' },
      S_N: { image: 'Bright-Mines-S_N.png' },
      W_E: { image: 'Bright-Mines-W_E.png' },
      W_N: { image: 'Bright-Mines-W_N.png' },
      W_N_E: { image: 'Bright-Mines-W_N_E.png' },
      W_S: { image: 'Bright-Mines-W_S.png' },
      W_S_E: { image: 'Bright-Mines-W_S_E.png' },
      W_S_N: { image: 'Bright-Mines-W_S_N.png' },
      W_S_N_E: { image: 'Bright-Mines-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}

export function createSilverWallNDAComponent(typeId: string) {
  return new NeighbourDisplayAffected({
    typeId,
    adjacencyImageMap: {
      NONE: { image: 'Silver-Wall-NONE.png' },
      N: { image: 'Silver-Wall-N.png' },
      E: { image: 'Silver-Wall-W_E.png' },
      S: { image: 'Silver-Wall-S_N.png' },
      W: { image: 'Silver-Wall-W_E.png' },
      N_E: { image: 'Silver-Wall-N_E.png' },
      S_N_E: { image: 'Silver-Wall-S_N_E.png' },
      S_E: { image: 'Silver-Wall-S_E.png' },
      S_N: { image: 'Silver-Wall-S_N.png' },
      W_E: { image: 'Silver-Wall-W_E.png' },
      W_N: { image: 'Silver-Wall-W_N.png' },
      W_N_E: { image: 'Silver-Wall-W_N_E.png' },
      W_S: { image: 'Silver-Wall-W_S.png' },
      W_S_E: { image: 'Silver-Wall-W_S_E.png' },
      W_S_N: { image: 'Silver-Wall-W_S_N.png' },
      W_S_N_E: { image: 'Silver-Wall-W_S_N_E.png' },
    },
    pruneCardinalWhenSurrounded: true,
  });
}
