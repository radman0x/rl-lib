import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { acquireCombatTargetAtPosition } from '../mappers/acquire-combat-target-at-position.system';
import { resolveArmorSave } from '../mappers/resolve-armor-save.system';
import { resolveMeleeAttackDamage } from '../mappers/resolve-melee-attack-damage.system';
import { resolveStrike } from '../mappers/resolve-strike.system';
import { resolveWound } from '../mappers/resolve-wound.system';
import { AggressorEntity, AttackOrder, TargetPos } from '../systems.types';
import * as _ from 'lodash';
import { radClone } from '../systems.utils';

export type GatherAttackInfoArgs = AggressorEntity & TargetPos;
export type AttackInfo = { attack: AttackOrder | null };

export function gatherAttackInfo(em: EntityManager, rand: Chance.Chance) {
  return <T extends GatherAttackInfoArgs>(input: Observable<T>) =>
    input.pipe(
      map((msg) => acquireCombatTargetAtPosition(msg, em)),
      map((msg) => resolveStrike(msg, em, rand)),
      map((msg) => resolveWound(msg, em, rand)),
      map((msg) => resolveArmorSave(msg, em, rand)),
      map((msg) => resolveMeleeAttackDamage(msg, em)),
      map((msg) => {
        let attack: AttackOrder = null;
        if (msg.combatTargetId) {
          attack = _.pick(msg, [
            'combatTargetId',
            'aggressorId',
            'strikeSuccess',
            'woundSuccess',
            'armorSaveSuccess',
            'damage',
            'damageTargetId',
            'reapedId',
          ]);
        }
        return { ...radClone(msg), attack };
      })
    );
}
