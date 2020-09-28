import { EntityId, EntityManager } from 'rad-ecs';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { take, filter, map, mergeMap } from 'rxjs/operators';
import { Alignment } from '../components/alignment.model';
import { Description } from '../components/description.model';
import { Martial } from '../components/martial.model';
import { acquireCombatTargetAtPosition } from '../mappers/acquire-combat-target-at-position.system';
import { positionsAroundEntity } from '../mappers/positions-around-entity.system';
import { resolveMeleeAttackDamage } from '../mappers/resolve-melee-attack-damage.system';
import { resolveStrike } from '../mappers/resolve-strike.system';
import { resolveWound } from '../mappers/resolve-wound.system';
import { Order, AttackOrder } from '../systems.types';
import { addProperty } from '../systems.utils';

import * as Chance from 'chance';

interface Args {
  agentId: EntityId;
}

function combatString(msg: AttackOrder, em: EntityManager): string | null {
  if (msg && msg.combatTargetId) {
    const pluraler = (n: number) => (n === 1 ? '' : 's');
    const aggressorDescription = em.hasComponent(msg.aggressorId, Description)
      ? em.getComponent(msg.aggressorId, Description).short
      : 'unnamed';
    if (msg.woundSuccess && msg.strikeSuccess) {
      return `The ${aggressorDescription} hits you and inflicts ${
        msg.damage.amount
      } wound${pluraler(msg.damage.amount)}`;
    } else if (msg.strikeSuccess) {
      return `The ${aggressorDescription} hits you but fails to cause any damage`;
    } else {
      return `The ${aggressorDescription} misses `;
    }
  }
  return null;
}

export function produceAttackOrders(
  msg: Args,
  em: EntityManager,
  rand: Chance.Chance
): Observable<Order> {
  const out: BehaviorSubject<Args> = new BehaviorSubject(msg);

  return out.pipe(
    take(1),
    filter((msg) => msg.agentId && em.hasComponent(msg.agentId, Martial)),
    map((msg) => addProperty(msg, 'aggressorId', msg.agentId)),
    mergeMap((msg) => {
      return of(...positionsAroundEntity(msg, em));
    }),
    map((msg) =>
      acquireCombatTargetAtPosition(msg, em, (target) => {
        if (em.hasComponent(msg.agentId, Alignment) && target.has(Alignment)) {
          if (
            em.getComponent(msg.agentId, Alignment).type !==
            target.component(Alignment).type
          ) {
            return true;
          }
        }
        return false;
      })
    ),
    map((msg) => resolveStrike(msg, em, rand)),
    map((msg) => resolveWound(msg, em, rand)),
    map((msg) => resolveMeleeAttackDamage(msg, em)),
    map((msg) => {
      let attack: AttackOrder = null;
      if (msg.combatTargetId) {
        attack = {
          aggressorId: msg.aggressorId,
          combatTargetId: msg.combatTargetId,
          damage: msg.damage,
          damageTargetId: msg.damageTargetId,
          strikeSuccess: msg.strikeSuccess,
          woundSuccess: msg.woundSuccess,
        };
      }
      const result: Order = {
        move: null,
        attack,
        score: null,
        orderDescription: combatString(attack, em),
      };
      return result;
    })
  );
}
