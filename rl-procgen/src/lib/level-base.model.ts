import { GridPos } from '@rad/rl-ecs';
import { popRandomElement, randomInt } from '@rad/rl-utils';
import { BaseGenOptions } from '..';

export enum RoomTileType {
  OPEN = 0,
  ROOM_WALL = 1,
  DOOR = 2,
  FILL = 3,
  CORRIDOR = 4,
  ROOM = 5,
  CHASM = 6,
}

export class LevelBase {
  constructor(private baseOptions: BaseGenOptions) {}
  generateEnemies(spawnable: GridPos[]): number {
    const perTileChance = this.baseOptions.enemyChance / spawnable.length;
    let count = 0;
    for (const pos of spawnable) {
      if (Math.random() <= perTileChance) {
        this.baseOptions.enemyGenerator(pos);
        ++count;
      }
    }
    return count;
  }

  get maxEnemies() {
    return this.baseOptions.maxEnemyCount;
  }

  placeInitialEnemies(spawnable: GridPos[]) {
    for (let i = 0; i < this.baseOptions.initialEnemyCount; ++i) {
      this.baseOptions.enemyGenerator(popRandomElement(spawnable));
    }
  }

  placeInitialItems(spawnable: GridPos[]) {
    const { min, max } = this.baseOptions.initialItemRange;
    const numItems = randomInt(min, max);
    for (let i = 0; i < numItems; ++i) {
      this.baseOptions.itemGenerator(popRandomElement(spawnable));
    }
  }
}
