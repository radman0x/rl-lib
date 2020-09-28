import { EntityManager, EntityId } from 'rad-ecs';
import { Blockage } from '../components/blockage.model';

export function updateBlockageState(
  msg: { blockageId: EntityId | null },
  em: EntityManager
) {
  if (msg.blockageId === null) {
    return null;
  }
  const b = em.getComponent(msg.blockageId, Blockage);
  if (b === undefined) {
    return null;
  }

  let newState = b.active;
  for (const trigger of b.triggers) {
    const triggerComponent = em.getComponentByName(
      msg.blockageId,
      trigger.componentName
    );
    if (triggerComponent === undefined) {
      continue;
    }
    if (
      trigger.property !== undefined &&
      triggerComponent[trigger.property] === undefined
    ) {
      continue;
    }
    if (
      trigger.property !== undefined &&
      trigger.value !== undefined &&
      triggerComponent[trigger.property] !== trigger.value
    ) {
      continue;
    }

    console.log(
      `BLOCKING: trigger hit!, setting active to: ${trigger.activeState}`
    );
    em.setComponent(
      msg.blockageId,
      new Blockage({ ...b, active: trigger.activeState })
    );
    newState = trigger.activeState;
  }
  return newState;
}
