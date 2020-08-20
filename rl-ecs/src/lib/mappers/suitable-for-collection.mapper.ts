import { EntityId, EntityManager } from 'rad-ecs';
import { Fixed } from '../components/fixed.model';
import { Physical } from '../components/physical.model';
import { OperationStep } from '../operation-step.model';
import { addProperty } from '../systems.utils';

interface Args {
  collectibleId: EntityId | null;
}
export type SuitableForCollectionArgs = Args;

interface Out {
  suitableCollectId: EntityId | null;
}
export type SuitableForCollectionOut = Out;

function suitableForCollectionStep<T extends Args>(
  msg: T,
  em: EntityManager
): T & Out {
  const outId = 'suitableCollectId';
  if (msg.collectibleId === null) {
    return addProperty(msg, outId, null);
  }
  const physical = em.getComponent(msg.collectibleId, Physical);
  const fixed = em.getComponent(msg.collectibleId, Fixed);

  return addProperty(
    msg,
    'suitableCollectId',
    physical && !fixed ? msg.collectibleId : null
  );
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = suitableForCollectionStep;

export const suitableForCollection = typeCheck as typeof suitableForCollectionStep;
