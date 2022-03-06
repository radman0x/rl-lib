import {
  Charges,
  Consumable,
  Cooldown,
  findComponentInEntityChain,
  RadRxOperator,
} from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { NEVER, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { energyDelta } from '../mappers/energy-delta.system';

type EventArgs = {
  effectId: EntityId;
  effectSourceId: EntityId;
};

type CreateArgs = {
  em: EntityManager;
  canAfford: (em: EntityManager) => RadRxOperator<EventArgs & Out, any>;
  cannotAfford: (em: EntityManager) => RadRxOperator<EventArgs, any>;
};

type Out = {
  chargeCost?: number;
  useCost?: number;
  cooldownCost?: number;
};

/** Has conditional execution when effect cost can be afforded or not
 *
 * NOTE: this should be refactored, currently it looks for the first charge, use or cooldown that satisfies the cost
 * ultimately there should be different costs for each of these and they could apply simultaneously e.g. using a wand
 * could cost a charge and then require a cooldown before being used again also
 */
export function canAffordCost({ em, canAfford, cannotAfford }: CreateArgs) {
  return <T extends EventArgs>(input: Observable<T>) => {
    return input.pipe(
      map((msg) => ({ payerId: msg.effectId, ...msg })),
      map((msg) => energyDelta(msg, em)),
      // No energy cost found
      mergeMap((msg) =>
        msg.energyDelta === null
          ? of(msg).pipe(
              canAfford(em),
              mergeMap(() => NEVER)
            )
          : of(msg)
      ),
      mergeMap((msg) => {
        const chargesId = findComponentInEntityChain(em, msg.payerId, Charges);
        if (chargesId) {
          const charges = em.getComponent(chargesId, Charges);
          if (charges.curr + msg.energyDelta.amount >= 0) {
            return of({ ...msg, chargeCost: -msg.energyDelta.amount }).pipe(
              canAfford(em),
              mergeMap(() => NEVER)
            );
          } else {
            return of(msg).pipe(
              cannotAfford(em),
              mergeMap(() => NEVER)
            );
          }
        }
        return of(msg);
      }),
      mergeMap((msg) => {
        const consumableId = findComponentInEntityChain(em, msg.payerId, Consumable);
        if (consumableId) {
          const consumable = em.getComponent(consumableId, Consumable);
          if (consumable.uses + msg.energyDelta.amount >= 0) {
            return of({ ...msg, useCost: -msg.energyDelta.amount }).pipe(
              canAfford(em),
              mergeMap(() => NEVER)
            );
          } else {
            return of(msg).pipe(
              cannotAfford(em),
              mergeMap(() => NEVER)
            );
          }
        }
        return of(msg);
      }),
      mergeMap((msg) => {
        const cooldownId = findComponentInEntityChain(em, msg.payerId, Cooldown);
        if (cooldownId) {
          const cooldown = em.getComponent(cooldownId, Cooldown);
          if (cooldown.curr === 0) {
            return of({ ...msg, cooldownCost: -msg.energyDelta.amount }).pipe(
              canAfford(em),
              mergeMap(() => NEVER)
            );
          } else {
            return of(msg).pipe(
              cannotAfford(em),
              mergeMap(() => NEVER)
            );
          }
        }
        return of(msg);
      }),
      mergeMap((msg) =>
        of(msg).pipe(
          cannotAfford(em),
          mergeMap(() => NEVER)
        )
      )
    );
  };
}
