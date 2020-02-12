import { EntityManager, EntityId } from 'rad-ecs';
import { OperationStep } from '../operation-step.model';
import { TransitionAreaOut } from './transition-area.system';
import { radClone } from '../systems.utils';
import { Area } from '../area-resolver.model';
import { TargetEntity } from '../systems.types';
import { GridPos } from '../components/position.model';
import { Knowledge } from '../components/knowledge.model';
import { ValueMap } from '@rad/rl-utils';

type Args = Required<TransitionAreaOut> & TargetEntity;
export type AreaArgs = Args;

interface Out {
  viewerEntity: EntityId;
}
export type AreaOut = Out;

function areaStep<T extends Args>(
  msg: T,
  em: EntityManager,
  areaResolver: (areaId: string) => Area
): T & Out {
  const area = areaResolver(msg.areaTransition.areaId);
  console.log(`Loading new area: ${msg.areaTransition.areaId}`);
  const targetEntity = radClone(em.get(msg.targetId));
  em.clear();
  em.indexBy(GridPos);
  for (const entityComponents of area.entities) {
    em.createEntity(...entityComponents);
  }
  const targetId = em.createEntity(
    ...targetEntity.allComponents().map(entry => entry.component)
  ).id;
  em.setComponent(targetId, new GridPos(area.startPos));
  em.setComponent(
    targetId,
    new Knowledge({ current: new ValueMap(), history: new ValueMap() })
  );

  return { ...radClone(msg), viewerEntity: targetId };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = areaStep;

export const area = typeCheck as typeof areaStep;
