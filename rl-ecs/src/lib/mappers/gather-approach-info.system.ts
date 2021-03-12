import { ApproachTarget, GridPos, Knowledge, radClone } from '@rad/rl-ecs';
import { ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DistanceMap } from '../components/distance-map.model';

export interface GatherApproachInfoArgs {
  agentId: EntityId;
}

export interface ApproachInfo {
  approachTargetId: EntityId;
  canSee: boolean;
  distance?: number;
}

export function gatherApproachInfo(em: EntityManager) {
  return <T extends GatherApproachInfoArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => {
        let out: T & { approachInfo?: ApproachInfo } = msg;
        if (
          em.hasComponent(msg.agentId, Knowledge) &&
          em.hasComponent(msg.agentId, ApproachTarget)
        ) {
          const approachTargetId = em.getComponent(msg.agentId, ApproachTarget)
            .targetId;
          if (em.exists(approachTargetId)) {
            const targetPos = entityPos(
              approachTargetId,
              em.getComponent(msg.agentId, Knowledge)?.current ?? new ValueMap()
            );
            const distance = em
              .getComponent(approachTargetId, DistanceMap)
              ?.map.get(em.getComponent(msg.agentId, GridPos));

            out = {
              ...radClone(msg),
              approachInfo: {
                approachTargetId,
                canSee: !!targetPos,
                distance,
              },
            };
          }
        }
        return out;
      })
    );
  };
}

function entityPos(
  id: EntityId,
  knowledge: ValueMap<GridPos, EntityId[]>
): GridPos | undefined {
  for (const [pos, ids] of knowledge) {
    if (ids.find((e) => id === e)) {
      return pos;
    }
  }
  return undefined;
}
