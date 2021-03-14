import { Id } from '@rad/rl-applib';
import { isValidId } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { MemberOf } from '../components/member-of.model';
import { OperationStep } from '../operation-step.model';
import { EffectReport, EntityRemoval } from '../systems.types';

import * as _ from 'lodash';
import { radClone } from '../systems.utils';
import { Effects } from '../components/effects.model';
import { Inventory } from '../components/inventory.model';
import { StatusEffects } from '../components/status-effects.model';
import { GridPos } from '../components/position.model';

type Args = Partial<EffectReport> & EntityRemoval;
export type RemoveEntityArgs = Args;

type Out = EffectReport;
export type RemoveEntityOut = Out;

function removeEntityStep<T extends Args>(
  msg: T,
  em: EntityManager
): Id<T & Out> {
  let out = { ...radClone(msg) };
  if (
    msg.entityRemoval &&
    msg.entityRemoval.doRemove &&
    isValidId(msg.entityRemoval.removeId)
  ) {
    const removeId = msg.entityRemoval.removeId;
    if (em.hasComponent(removeId, MemberOf)) {
      const memberOf = em.getComponent(removeId, MemberOf);
      const parentComponent = em.getComponent(memberOf.id, memberOf.component);
      const arr: any[] = parentComponent[memberOf.property];
      const removeIndex = arr.findIndex((e) => e === removeId);
      parentComponent[memberOf.property].splice(removeIndex, 1);
      em.setComponent(memberOf.id, parentComponent);
    }

    for (const component of [Effects, Inventory, StatusEffects]) {
      if (component === Inventory && em.hasComponent(removeId, GridPos)) {
        em.getComponent(removeId, component)?.contents.forEach((id) => {
          em.removeComponent(id, MemberOf);
          em.setComponent(id, em.getComponent(removeId, GridPos));
        });
        continue;
      }
      em.getComponent(removeId, component)?.contents.forEach((id) => {
        removeEntityStep(
          { entityRemoval: { doRemove: true, removeId: id } },
          em
        );
      });
    }

    em.remove(removeId);
    _.set(
      out,
      'effectReport.removeEntity.worldStateChangeDescription',
      `entity: ${removeId} removed}`
    );
  }
  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = removeEntityStep;

export const removeEntity = typeCheck as typeof removeEntityStep;
