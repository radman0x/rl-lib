import { EntityId, EntityManager, Entity } from 'rad-ecs';
import { AreaResolver } from '../area-resolver.model';
import { OperationStep } from '../operation-step.model';
import { TargetEntity } from '../systems.types';
import { radClone } from '../systems.utils';
import { TransitionAreaOut } from './transition-area.system';
import { GridPos } from '../components/position.model';
import { AreaIngress } from '../components/area-ingress';

type Args = Required<TransitionAreaOut> & TargetEntity;
export type AreaArgs = Args;

interface Out {
  viewerEntity: EntityId;
}
export type AreaOut = Out;

function areaStep<T extends Args>(
  msg: T,
  em: EntityManager,
  areaResolver: AreaResolver
): T & Out {
  const targetEntity = em.get(msg.targetId);
  const targetPos = targetEntity.component(GridPos);
  em.remove(msg.targetId);
  const prevArea = em.export();
  areaResolver.setSaved(areaResolver.currentArea(), prevArea.entities);
  em.clear();
  areaResolver.load(msg.areaTransition.areaId, em);

  em.add(targetEntity);
  let ingressFound = false;
  em.each((e: Entity, ai: AreaIngress) => {
    if (ai.label === msg.areaTransition.ingressLabel) {
      console.log(`Matched ingress label`);
      const playerAt = radClone(e.component(GridPos));
      console.log(`Player placed at: ${playerAt} in new area`);
      em.setComponent(targetEntity.id, playerAt);
      ingressFound = true;
    }
  }, AreaIngress);
  if (!ingressFound) {
    throw Error(
      `Ingress label: ${msg.areaTransition.ingressLabel} not found in new level!!`
    );
  }

  return { ...radClone(msg), viewerEntity: msg.targetId };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = areaStep;

export const area = typeCheck as typeof areaStep;
