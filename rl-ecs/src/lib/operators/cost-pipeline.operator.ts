import { EntityManager } from 'rad-ecs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { Charges } from '../components/charges.model';
import { Consumable } from '../components/consumable.model';
import { Cooldown } from '../components/cooldown.model';
import { energyDelta } from '../mappers/energy-delta.system';
import { ActiveEffect, Payer } from '../systems.types';
import { radClone } from '../systems.utils';
import { findComponentInEntityChain } from '../utils/rad-ecs.utils';

type Args = Payer;
export function costPipeline<T extends Args>(msg: T, em: EntityManager) {
  return of(msg).pipe(
    map((msg) => energyDelta(msg, em)),
    map((msg) => {
      let costPaid: boolean;
      costPaid = !isNullOrUndefined(msg.costPaid) ? msg.costPaid : null;
      if (msg.energyDelta !== null) {
        const chargesId = findComponentInEntityChain(em, msg.payerId, Charges);
        if (chargesId) {
          const currCharges = em.getComponent(chargesId, Charges);
          if (currCharges.curr > 0) {
            em.setComponent(
              chargesId,
              new Charges({
                ...currCharges,
                curr: currCharges.curr + msg.energyDelta.amount,
              })
            );
            costPaid = true;
          }
        }
      }
      return radClone({ ...msg, costPaid });
    }),
    map((msg) => {
      let costPaid: boolean;
      costPaid = !isNullOrUndefined(msg.costPaid) ? msg.costPaid : null;
      if (msg.energyDelta !== null) {
        const consumableId = findComponentInEntityChain(
          em,
          msg.payerId,
          Consumable
        );
        if (consumableId) {
          const consumable = em.getComponent(consumableId, Consumable);
          em.setComponent(
            consumableId,
            new Consumable({
              ...consumable,
              uses: consumable.uses + msg.energyDelta.amount,
            })
          );
          costPaid = true;
        }
      }
      return radClone({ ...msg, costPaid });
    }),
    map((msg) => {
      let costPaid: boolean;
      costPaid = !isNullOrUndefined(msg.costPaid) ? msg.costPaid : null;
      if (msg.energyDelta !== null) {
        const cooldownId = findComponentInEntityChain(
          em,
          msg.payerId,
          Cooldown
        );
        if (cooldownId) {
          const cooldown = em.getComponent(cooldownId, Cooldown);
          if (cooldown.curr === 0) {
            em.setComponent(
              cooldownId,
              new Cooldown({
                ...cooldown,
                curr: -msg.energyDelta.amount,
              })
            );
            costPaid = true;
          }
        }
      }
      return radClone({ ...msg, costPaid });
    })
  );
}
