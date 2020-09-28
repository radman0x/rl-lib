import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, reduce, take } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { MovingAgent } from '../components/moving-agent.model';
import { GridPosData } from '../components/position.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity, IntegrityArgs } from '../mappers/integrity.system';
import { scoreApproach } from '../mappers/score-approach.system';
import { scoreAttack } from '../mappers/score-attack.system';
import { produceAttackOrders } from '../operators/produce-attack-orders.operator';
import { produceMoveOrders } from '../operators/produce-move-orders.operator';
import { Order } from '../systems.types';
import { addProperty, radClone } from '../systems.utils';

interface Args {
  agentId: EntityId;
}

function produceCandidateOrders<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Observable<Order> {
  return merge(produceMoveOrders(msg, em), produceAttackOrders(msg, em, rand));
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
      filter(msg => em.exists(msg.agentId)), // in case agent got reaped due to other agent actions
      mergeMap(msg =>
        produceCandidateOrders(msg, em, rand).pipe(
          map(msg => scoreApproach(msg, em)),
          map(msg => scoreAttack(msg, em)),
          reduce(
            (acc, curr) => {
              return (!acc || curr.score > acc.score
                ? curr
                : acc) as typeof curr;
            },
            { score: null, move: null, attack: null, orderDescription: null }
          ),
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
          map(msg => integrity(msg, em)),
          map(msg => grimReaper(msg, em))
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
