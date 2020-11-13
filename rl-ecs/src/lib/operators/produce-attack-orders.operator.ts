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
import { markForDeath } from '../mappers/mark-for-death.system';
import { WeaponSkill } from '../components/weapon-skill.model';
import { resolveArmorSave } from '../mappers/resolve-armor-save.system';

interface Args {
  agentId: EntityId;
}

function combatString(msg: AttackOrder, em: EntityManager): string | null {
  if (msg && msg.combatTargetId) {
    const aggressorDescription = em.hasComponent(msg.aggressorId, Description)
      ? em.getComponent(msg.aggressorId, Description).short
      : 'unnamed';
    const targetDescription = em.hasComponent(msg.combatTargetId, Description)
      ? em.getComponent(msg.combatTargetId, Description).short
      : 'unnamed';
    if (msg.reapedId) {
      return `The ${aggressorDescription} kills ${targetDescription}!`;
    }
    if (msg.woundSuccess && msg.strikeSuccess && !msg.armorSaveSuccess) {
      return `The ${aggressorDescription} wounds ${targetDescription}`;
    } else if (msg.woundSuccess && msg.strikeSuccess && msg.armorSaveSuccess) {
      return `The ${aggressorDescription}'s blow is deflected by ${targetDescription}'s armor!`;
    } else if (msg.strikeSuccess) {
      return `The ${aggressorDescription} hits ${targetDescription} but fails to cause any damage`;
    } else {
      return `The ${aggressorDescription} misses ${targetDescription}`;
    }
  }
  return null;
}

export function produceAttackOrders<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Observable<Order> {
  const out: BehaviorSubject<T> = new BehaviorSubject(msg);

  return out
    .pipe(
      take(1),
      filter((msg) => msg.agentId && em.hasComponent(msg.agentId, WeaponSkill)),
      map((msg) => addProperty(msg, 'aggressorId', msg.agentId)),
      mergeMap((msg) => {
        return of(...positionsAroundEntity(msg, em));
      }),
      map((msg) =>
        acquireCombatTargetAtPosition(msg, em, (target) => {
          if (
            em.hasComponent(msg.agentId, Alignment) &&
            target.has(Alignment)
          ) {
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
      map((msg) => resolveArmorSave(msg, em, rand))
    )
    .pipe(
      map((msg) => resolveMeleeAttackDamage(msg, em)),
      map((msg) => markForDeath(msg, em)),
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
            armorSaveSuccess: msg.armorSaveSuccess,
            reapedId: msg.reapedId,
          };
        }
        const result: Order = {
          agentId: msg.agentId,
          move: null,
          attack,
          score: null,
          orderDescription: combatString(attack, em),
        };
        return result;
      })
    );
}
