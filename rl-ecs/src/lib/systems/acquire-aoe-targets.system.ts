import { EntityManager } from 'rad-ecs';
import * as clone from 'shallow-clone';
import { OperationStepMulti } from 'src/lib/operation-step.model';
import { GridPos } from '../components/position.model';
import { EntityId } from '../ecs.types';
import { entitiesWithinRadius } from './system.utils';

interface Args {
  aoeCenter: GridPos;
  aoeRadius: number;
}
export type AcquireAOETargetsArgs = Args;

interface Out {
  targetId: EntityId;
}
export type AcquireAoeTargetsOut = Out;

function acquireAoeTargetsStep<T extends Args>(
  msg: T,
  em: EntityManager
): (T & Out)[] {
  if (!msg.aoeCenter || !msg.aoeRadius) {
    return [];
  }

  const out = clone(msg);
  delete out.aoeCenter;
  delete out.aoeRadius;

  return entitiesWithinRadius(msg.aoeCenter, msg.aoeRadius, em).map(e => ({
    ...clone(out),
    targetId: e.id
  }));
}

type StepFunc = OperationStepMulti<Args, Out>;
const typeCheck: StepFunc = acquireAoeTargetsStep;

export const acquireAoeTargets = typeCheck as typeof acquireAoeTargetsStep;
