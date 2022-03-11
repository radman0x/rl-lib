import { AttackOrder } from '@rad/rl-ecs';
import { EntityId, EntityManager } from 'rad-ecs';
import { merge, Observable, of } from 'rxjs';
import * as rxjsSpy from 'rxjs-spy';
import { filter, map, mapTo, mergeMap, reduce, tap } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { EndType } from '../components/end-state.model';
import { Mental, MentalState } from '../components/mental.model';
import { MovingAgent } from '../components/moving-agent.model';
import { GridPos, GridPosData } from '../components/position.model';
import { Speed } from '../components/speed.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import { gatherApproachInfo } from '../mappers/gather-approach-info.system';
import { grimReaper } from '../mappers/grim-reaper.system';
import { integrity, IntegrityArgs } from '../mappers/integrity.system';
import { markForDeath } from '../mappers/mark-for-death.system';
import { scoreApproach } from '../mappers/score-approach.system';
import { scoreAttack } from '../mappers/score-attack.system';
import { scoreLightPreference } from '../mappers/score-light-preference.system';
import { scoreMove } from '../mappers/score-move.system';
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
  return merge(produceMoveOrders<T>(msg, em), produceAttackOrders<T>(msg, em, rand)).pipe(
    rxjsSpy.operators.tag('produceCandidateOrders')
  );
}

/** Update all agents
 *
 * Produces a single message no matter what that contains a record of messages from agent actions
 */
export function allAgentUpdateFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  rand: Chance.Chance,
  ender: (endType: EndType) => void = null,
  attackAnimator?: <T extends { attack: AttackOrder | null }>(input: Observable<T>) => Observable<T>
) {
  return <T extends Partial<Messages> & { playerZLevel: number }>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((inputMsg) =>
        of(inputMsg)
          .pipe(
            rxjsSpy.operators.tag('turnEnd.allAgentUpdate'),
            map((msg) => addProperty(msg, 'componentTypes', [MovingAgent, GridPos])),
            mergeMap((msg) => {
              // All agents that can move AND are on the same level as the player
              const agents = entitiesWithComponents(msg, em, 'agentId').filter(
                (msg) => msg.agentId && em.getComponent(msg.agentId, GridPos).z === msg.playerZLevel
              );
              return of(...agents);
            }),
            filter((msg) => em.exists(msg.agentId)), // in case agent got reaped due to other agent actions
            filter((msg) => {
              const modifiedMental = getModifiedComponent(msg.agentId, Mental, em);
              return !(modifiedMental && modifiedMental.state === MentalState.STUNNED);
            }),
            mergeMap((beforeSpeed) =>
              em.hasComponent(beforeSpeed.agentId, Speed)
                ? of(beforeSpeed).pipe(
                    tap((msg) => {
                      const orig = em.getComponent(msg.agentId, Speed);
                      em.setComponent(
                        msg.agentId,
                        new Speed({
                          ...orig,
                          currActionPoints: orig.currActionPoints + orig.recoupAmount,
                        })
                      );
                    }),
                    filter((msg) => {
                      const speed = em.getComponent(msg.agentId, Speed);
                      return speed.currActionPoints >= speed.actionCost;
                    }),
                    tap((msg) => {
                      const orig = em.getComponent(msg.agentId, Speed);
                      em.setComponent(
                        msg.agentId,
                        new Speed({
                          ...orig,
                          currActionPoints: orig.currActionPoints - orig.actionCost,
                        })
                      );
                    })
                  )
                : of(beforeSpeed)
            )
          )
          .pipe(
            gatherApproachInfo(em),
            mergeMap((beforeOrders) =>
              produceCandidateOrders(beforeOrders, em, rand)
                .pipe(
                  scoreMove(em),
                  map((msg) => scoreApproach({ ...msg, ...beforeOrders }, em)),
                  map((msg) => scoreRandomMove(msg, em, rand)),
                  map((msg) => scoreAttack(msg, em)),
                  scoreLightPreference(em),
                  map((msg) => {
                    // round the score
                    if (msg.score === null) {
                      return msg;
                    }
                    const score = Math.round((msg.score + Number.EPSILON) * 100) / 100;
                    return { ...radClone(msg), score };
                  }),
                  rxjsSpy.operators.tag('turnEnd.allAgentUpdate.orderScores')
                )
                .pipe(
                  reduce(
                    (acc, curr) => {
                      if (acc.score === null) {
                        return curr;
                      }
                      if (curr.score === null) {
                        return acc as typeof curr;
                      }
                      if (acc.score === curr.score) {
                        return (Math.random() > 0.5 ? acc : curr) as typeof curr;
                      }
                      return (curr.score > acc.score ? curr : acc) as typeof curr;
                    },
                    {
                      score: null,
                      move: null,
                      attack: null,
                      orderDescription: null,
                      agentId: null,
                    }
                  ),
                  // map((msg) => {
                  //   console.log(
                  //     `CHOSEN ORDER: ${JSON.stringify(msg, null, 2)}`
                  //   );
                  //   return msg;
                  // }),
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
                  attackAnimator ?? tap(() => {}),
                  map((msg) => spatial(msg, em)),
                  map((msg) => integrity(msg, em)),
                  map((msg) => markForDeath(msg, em)),
                  map((msg) => grimReaper(msg, em)),
                  mergeMap((msg) =>
                    housekeepingFlowInstant(em, areaResolver, ender).pipe(mapTo(msg))
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
              const messages = msg.messages ?? [];
              return {
                ...radClone(msg),
                messages: [...messages, ...orderMessages],
              };
            })
          )
      )
    );
  };
}
