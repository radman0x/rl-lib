import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import * as _ from 'lodash';
import { Entity, EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { AreaIngress } from '../components/area-ingress.model';
import { GridPos } from '../components/position.model';
import { buildOpenMap, lightPositions } from '../mappers/lit-positions.system';
import { TransitionAreaOut } from '../mappers/transition-area.system';
import { OperationStep } from '../operation-step.model';
import {
  EffectReport,
  EffectTarget,
  WorldStateChangeReport,
} from '../systems.types';
import { radClone } from '../systems.utils';
import { AreaResolver } from '../utils/area-resolver.util';

type Args = Partial<EffectReport> &
  Partial<TransitionAreaOut> &
  Partial<EffectTarget> &
  Partial<WorldStateChangeReport>;
export type AreaArgs = Args;

type Out = EffectReport;
export type AreaOut = Out;

function areaStep<T extends Args>(
  msg: T,
  em: EntityManager,
  areaResolver: AreaResolver
): Id<T & Out> {
  let out = { ...radClone(msg) };
  if (msg.areaTransition && isValidId(msg.effectTargetId)) {
    const targetEntity = em.get(msg.effectTargetId);
    areaResolver.load(msg.areaTransition.areaId, em);

    let ingressFound = false;
    em.each((e: Entity, ai: AreaIngress) => {
      if (!ingressFound && ai.label === msg.areaTransition.ingressLabel) {
        // console.log(`Matched ingress label`);
        const playerAt = radClone(e.component(GridPos));
        // console.log(`Player placed at: ${playerAt} in new area`);
        em.setComponent(targetEntity.id, playerAt);
        ingressFound = true;
      }
    }, AreaIngress);
    if (!ingressFound) {
      throw Error(
        `Ingress label: ${msg.areaTransition.ingressLabel} not found in new level!!`
      );
    }
    const viewerPos = em.getComponent(targetEntity.id, GridPos);
    of({ viewerPos }).pipe(buildOpenMap(em), lightPositions(em)).subscribe();
    _.set(
      out,
      'effectReport.area.worldStateChangeDescription',
      `enter ${msg.areaTransition.areaId}`
    );
  }
  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = areaStep;

export const area = typeCheck as typeof areaStep;
