import { EntityId, EntityManager, Entity } from 'rad-ecs';
import { AreaResolver } from '../utils/area-resolver.util';
import { OperationStep } from '../operation-step.model';
import {
  TargetEntity,
  EffectTarget,
  WorldStateChangeDescription,
  WorldStateChanged
} from '../systems.types';
import { radClone } from '../systems.utils';
import { TransitionAreaOut } from '../mappers/transition-area.system';
import { GridPos } from '../components/position.model';
import { AreaIngress } from '../components/area-ingress';
import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';

type Args = Partial<TransitionAreaOut> & Partial<EffectTarget>;
export type AreaArgs = Args;

type Out = WorldStateChangeDescription & WorldStateChanged;
export type AreaOut = Out;

function areaStep<T extends Args>(
  msg: T,
  em: EntityManager,
  areaResolver: AreaResolver
): Id<T & Out> {
  if (msg.areaTransition && isValidId(msg.effectTargetId)) {
    const targetEntity = em.get(msg.effectTargetId);
    areaResolver.load(msg.areaTransition.areaId, em);

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

    return {
      ...radClone(msg),
      worldStateChangeDescription: `enter ${msg.areaTransition.areaId}`,
      worldStateChanged: true
    };
  }
  return {
    ...radClone(msg),
    worldStateChanged: msg['worldStateChanged'] || false,
    worldStateChangeDescription: msg['worldStateChangeDescription'] || null
  };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = areaStep;

export const area = typeCheck as typeof areaStep;
