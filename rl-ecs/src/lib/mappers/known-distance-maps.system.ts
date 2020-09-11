import { OperationStep } from '../operation-step.model';
import { EntityManager, EntityId } from 'rad-ecs';
import { radClone, addProperty } from '../systems.utils';
import { Id } from '@rad/rl-applib';
import { ActiveAgent, DistanceMaps } from '../systems.types';
import { isValidId, withinRange } from '@rad/rl-utils';
import { Sighted } from '../components/sighted.model';
import { DistanceMap } from '../components/distance-map.model';
import { GridPos } from '../components/position.model';

type Args = ActiveAgent;
export type KnownDistanceMapsArgs = Args;

type Out = DistanceMaps;
export type KnownDistanceMapsOut = Out;

function knownDistanceMapsStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  if (isValidId(msg.agentId)) {
    const [sighted, agentPos] = em.getComponents(msg.agentId, Sighted, GridPos);
    if (sighted && agentPos) {
      const validMaps: EntityId[] = [];
      em.each(
        (e, dm, pos) => {
          if (withinRange(sighted.range, pos, agentPos)) {
            validMaps.push(e.id);
          }
        },
        DistanceMap,
        GridPos
      );
      return addProperty(msg, 'distanceMaps', validMaps);
    }
  }
  return addProperty(msg, 'distanceMaps', null);
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = knownDistanceMapsStep;

export const knownDistanceMaps = typeCheck as typeof knownDistanceMapsStep;
