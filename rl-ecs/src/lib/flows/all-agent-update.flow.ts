import { EntityId, EntityManager } from 'rad-ecs';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { map, mergeMap, reduce, take } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { Description } from '../components/description.model';
import { MovingAgent } from '../components/moving-agent.model';
import { GridPosData } from '../components/position.model';
import { acquireCombatTargetAtPosition } from '../mappers/acquire-combat-target-at-position.system';
import { canOccupyPosition } from '../mappers/can-occupy-position.system';
import { canStandAtPosition } from '../mappers/can-stand-at-position.system';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import { integrity, IntegrityArgs } from '../mappers/integrity.system';
import { knownDistanceMaps } from '../mappers/known-distance-maps.system';
import { positionBlocked } from '../mappers/position-blocked.system';
import { positionsAroundEntity } from '../mappers/positions-around-entity.system';
import { resolveMeleeAttackDamage } from '../mappers/resolve-melee-attack-damage.system';
import { resolveMove } from '../mappers/resolve-move.system';
import { resolveStrike } from '../mappers/resolve-strike.system';
import { resolveWound } from '../mappers/resolve-wound.system';
import { scoreApproach } from '../mappers/score-approach.system';
import { scoreAttack } from '../mappers/score-attack.system';
import { AttackOrder } from '../systems.types';
import { addProperty, radClone } from '../systems.utils';

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

interface MoveOrder {
  newPosition: GridPosData;
  movingId: EntityId;
  distanceMaps: EntityId[];
}

export interface Order {
  score: number | null;
  orderDescription: string;
  move: MoveOrder | null;
  attack: AttackOrder | null;
}

interface Args {
  agentId: EntityId;
}
type Out = Order;
function produceCandidateOrders<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Observable<Order> {
  const out: BehaviorSubject<T> = new BehaviorSubject(msg);

  const possibleMoveOrders = out.pipe(
    take(1),
    map(msg => knownDistanceMaps(msg, em)),
    mergeMap(msg => {
      return of(...positionsAroundEntity(msg, em));
    }),
    map(msg => ({ ...radClone(msg), movingId: msg.agentId })),
    map(msg => positionBlocked(msg, em)),
    map(msg => canOccupyPosition(msg, em)),
    map(msg => canStandAtPosition(msg, em)),
    map(msg => resolveMove(msg)),
    map(msg => {
      let move: MoveOrder = null;
      if (msg.newPosition) {
        move = {
          newPosition: msg.newPosition,
          movingId: msg.movingId,
          distanceMaps: msg.distanceMaps
        };
      }
      return { move, attack: null, score: null, orderDescription: '' };
    })
  );

  const possibleAttackOrders = out.pipe(
    take(1),
    map(msg => addProperty(msg, 'aggressorId', msg.agentId)),
    mergeMap(msg => {
      return of(...positionsAroundEntity(msg, em));
    }),
    map(msg => acquireCombatTargetAtPosition(msg, em)),
    map(msg => resolveStrike(msg, em, rand)),
    map(msg => resolveWound(msg, em, rand)),
    map(msg => resolveMeleeAttackDamage(msg, em)),
    map(msg => {
      let attack: AttackOrder = null;
      if (msg.combatTargetId) {
        attack = {
          aggressorId: msg.aggressorId,
          combatTargetId: msg.combatTargetId,
          damage: msg.damage,
          damageTargetId: msg.damageTargetId,
          strikeSuccess: msg.strikeSuccess,
          woundSuccess: msg.woundSuccess
        };
      }
      return {
        move: null,
        attack,
        score: null,
        orderDescription: combatString(attack, em)
      };
    })
  );

  return merge(possibleMoveOrders, possibleAttackOrders);
}

export function allAgentUpdateFlow(em: EntityManager, rand: Chance.Chance) {
  const out = {
    start$: new Subject(),
    finish$: new Subject<Order[]>()
  };

  out.start$
    .pipe(
      take(1),
      map(() => addProperty({}, 'componentTypes', [MovingAgent])),
      mergeMap(msg => of(...entitiesWithComponents(msg, em, 'agentId'))),
      mergeMap(msg =>
        produceCandidateOrders(msg, em, rand).pipe(
          map(msg => {
            console.log(`${JSON.stringify(msg, null, 2)}`);
            return msg;
          }),
          map(msg => scoreApproach(msg, em)),
          map(msg => scoreAttack(msg, em)),
          reduce((acc, curr) => {
            return (!acc || curr.score > acc.score ? curr : acc) as typeof curr;
          }),
          map(msg => {
            let spatial: { newPosition: GridPosData; movingId: EntityId } = {
              newPosition: null,
              movingId: null
            };
            let integrity: IntegrityArgs = {
              damage: null,
              damageTargetId: null
            };
            if (msg.attack && msg.score !== null) {
              integrity = msg.attack;
            }
            if (msg.move && msg.score !== null) {
              spatial = msg.move;
            }
            return { ...radClone(msg), ...spatial, ...integrity };
          }),
          map(msg => spatial(msg, em)),
          map(msg => integrity(msg, em))
        )
      ),
      reduce(
        (acc, curr) => {
          if (curr.score !== null) {
            acc.push(curr);
          }
          return acc;
        },
        [] as Order[]
      )
    )
    .subscribe(out.finish$);

  return out;
}

// out.start$
// .pipe(
//   take(1),
//   map(() => addProperty({}, 'componentTypes', [MovingAgent])),
//   mergeMap(msg => of(...entitiesWithComponents(msg, em, 'agentId'))),
//   mergeMap(msg =>
//     of(msg).pipe(
//       map(msg => knownDistanceMaps(msg, em)),
//       mergeMap(msg => {
//         return of(...positionsAroundEntity(msg, em));
//       }),
//       map(msg => ({ ...radClone(msg), movingId: msg.agentId })),
//       map(msg =>
//         assessBumpMove(
//           addProperty(msg, 'aggressorId', msg.movingId),
//           em,
//           rand
//         )
//       ),
//       mergeMap(msg =>
//         of(
//           {
//             ...nullify(msg),
//             ...msg.move,
//             distanceMaps: msg.distanceMaps,
//             score: null,
//             orderDescription: null
//           },
//           {
//             ...nullify(msg),
//             ...msg.attack,
//             score: null,
//             orderDescription: combatString(msg.attack, em)
//           }
//         )
//       ),
//       map(msg => scoreApproach(msg, em)),
//       map(msg => scoreAttack(msg, em)),
//       reduce((acc, curr) => {
//         return (!acc || curr.score > acc.score ? curr : acc) as typeof curr;
//       }),
//       map(msg => integrity(msg, em)),
//       map(msg => spatial(msg, em))
//     )
//   ),
//   reduce(
//     (acc, curr) => {
//       if (curr.score !== null) {
//         acc.push(curr);
//       }
//       return acc;
//     },
//     [] as Final[]
//   )
// )
// .subscribe(out.finish$);
