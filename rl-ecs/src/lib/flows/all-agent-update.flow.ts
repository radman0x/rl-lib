import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of } from 'rxjs';
import * as rxjsSpy from 'rxjs-spy';
import { filter, map, mapTo, mergeMap, reduce } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { EndType } from '../components/end-state.model';
import { Mental, MentalState } from '../components/mental.model';
import { MovingAgent } from '../components/moving-agent.model';
import { GridPosData } from '../components/position.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import { gatherApproachInfo } from '../mappers/gather-approach-info.system';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity, IntegrityArgs } from '../mappers/integrity.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import { scoreApproach } from '../mappers/score-approach.system';
import { scoreAttack } from '../mappers/score-attack.system';
import { scoreRandomMove } from '../mappers/score-random-move.system';
import { getModifiedComponent } from '../operators/modifiered-entity-pipeline.operator';
import { produceAttackOrders } from '../operators/produce-attack-orders.operator';
import { produceMoveOrders } from '../operators/produce-move-orders.operator';
import { Messages, Order } from '../systems.types';
import { addProperty, radClone } from '../systems.utils';
import { AreaResolver } from '../utils/area-resolver.util';
import { housekeepingFlowInstant } from './housekeeping.flow';

interface Args {
  agentId: EntityId;
}

function produceCandidateOrders<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): Observable<Order> {
  return merge(
    produceMoveOrders<T>(msg, em),
    produceAttackOrders<T>(msg, em, rand)
  ).pipe(rxjsSpy.operators.tag('produceCandidateOrders'));
}

export function allAgentUpdateFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  rand: Chance.Chance,
  messageLog: (string) => void = null,
  ender: (endType: EndType) => void = null
) {
  return <T extends Partial<Messages>>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((inputMsg) =>
        of(inputMsg)
          .pipe(
            rxjsSpy.operators.tag('turnEnd.allAgentUpdate'),
            map((msg) => addProperty(msg, 'componentTypes', [MovingAgent])),
            mergeMap((msg) =>
              of(...entitiesWithComponents(msg, em, 'agentId'))
            ),
            filter((msg) => em.exists(msg.agentId)), // in case agent got reaped due to other agent actions
            filter((msg) => {
              const modifiedMental = getModifiedComponent(
                msg.agentId,
                Mental,
                em
              );
              return !(
                modifiedMental && modifiedMental.state === MentalState.STUNNED
              );
            }),
            gatherApproachInfo(em),
            mergeMap((beforeOrders) =>
              produceCandidateOrders(beforeOrders, em, rand)
                .pipe(
                  map((msg) => scoreApproach({ ...msg, ...beforeOrders }, em)),
                  map((msg) => scoreRandomMove(msg, em, rand)),
                  map((msg) => scoreAttack(msg, em)),
                  rxjsSpy.operators.tag('turnEnd.allAgentUpdate.orderScores'),
                  reduce(
                    (acc, curr) => {
                      if (curr.score === null) {
                        return acc;
                      }
                      return (!acc || curr.score > acc.score
                        ? curr
                        : acc) as typeof curr;
                    },
                    {
                      score: null,
                      move: null,
                      attack: null,
                      orderDescription: null,
                      agentId: null,
                    }
                  ),
                  rxjsSpy.operators.tag('turnEnd.allAgentUpdate.chosenOrder'),
                  map((msg) => {
                    let spatial: {
                      newPosition: GridPosData;
                      movingId: EntityId;
                    } = {
                      newPosition: null,
                      movingId: null,
                    };
                    let integrity: IntegrityArgs = {
                      damage: null,
                      damageTargetId: null,
                    };
                    if (msg.attack && msg.score !== null) {
                      integrity = msg.attack;
                    }
                    if (msg.move && msg.score !== null) {
                      spatial = msg.move;
                    }
                    return { ...radClone(msg), ...spatial, ...integrity };
                  })
                )
                .pipe(
                  map((msg) => spatial(msg, em)),
                  map((msg) => integrity(msg, em)),
                  map((msg) => markForDeath(msg, em)),
                  map((msg) => grimReaper(msg, em)),
                  mergeMap((msg) =>
                    housekeepingFlowInstant(em, areaResolver, ender).pipe(
                      mapTo(msg)
                    )
                  )
                )
            ),
            reduce(
              (acc, curr) => {
                if (curr.score !== null) {
                  acc.orders.push(curr);
                }
                return acc;
              },
              { ...inputMsg, orders: [] } as { orders: Order[] } & T
            )
          )
          .pipe(
            rxjsSpy.operators.tag('turnEnd.allAgentUpdate.finalOrders'),
            map((msg) => {
              const orderMessages: string[] = [];
              for (const order of msg.orders) {
                if (order.orderDescription !== '') {
                  orderMessages.push(order.orderDescription);
                }
              }
              return {
                orders: msg,
                messages: [...msg.messages, ...orderMessages],
              };
            })
          )
      )
    );
  };
}
