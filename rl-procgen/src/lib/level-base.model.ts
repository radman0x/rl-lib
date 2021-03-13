import { GridPos } from '@rad/rl-ecs';
import { BaseGenOptions } from '..';

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
}
