import { EntityId, EntityManager } from 'rad-ecs';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, map, mergeMap, take } from 'rxjs/operators';
import { Alignment } from '../components/alignment.model';
import { WeaponSkill } from '../components/weapon-skill.model';
import { acquireCombatTargetAtPosition } from '../mappers/acquire-combat-target-at-position.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import { positionsAroundEntity } from '../mappers/positions-around-entity.system';
import { resolveArmorSave } from '../mappers/resolve-armor-save.system';
import { resolveMeleeAttackDamage } from '../mappers/resolve-melee-attack-damage.system';
import { resolveStrike } from '../mappers/resolve-strike.system';
import { resolveWound } from '../mappers/resolve-wound.system';
import { AttackOrder, Order } from '../systems.types';
import { addProperty, enemyCombatString } from '../systems.utils';

interface Args {
  agentId: EntityId;
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
          orderDescription: enemyCombatString(attack, em),
        };
        return result;
      }),
      filter((msg) => msg.attack !== null)
    );
}
