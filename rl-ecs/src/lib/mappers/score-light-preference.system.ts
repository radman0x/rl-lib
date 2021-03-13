import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LightLevel } from '../components/light-level.model';
import { LightPreference } from '../components/light-preference.model';
import { GridPos } from '../components/position.model';
import { MoveOrder } from '../systems.types';
import { radClone } from '../systems.utils';

export interface ScoreLightAvoidantArgs {
  score: number | null;
  move: MoveOrder | null;
  agentId: EntityId | null;
}

export function scoreLightPreference(em: EntityManager) {
  return <T extends ScoreLightAvoidantArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        let score = msg.score === null ? 0 : msg.score;
        if (msg.move) {
          const agentPreference = em.getComponent(msg.agentId, LightPreference);
          if (agentPreference) {
            const lightLevel = em
              .matchingIndex(new GridPos(msg.move.newPosition))
              .find((e) => e.has(LightLevel))
              ?.component(LightLevel);
            if (lightLevel && lightLevel.level >= agentPreference.threshold) {
              const multiplyTimes =
                lightLevel.level - agentPreference.threshold;
              let strength = agentPreference.strength;
              for (let i = 0; i < multiplyTimes; ++i) {
                strength *= agentPreference.multiplier;
              }
              score += strength;
            }
          }
        }
        return { ...radClone(msg), score };
      })
    );
  };
}
