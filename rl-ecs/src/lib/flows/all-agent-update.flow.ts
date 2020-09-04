import { xyPositionsAround } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { of, Subject } from 'rxjs';
import { map, mergeMap, reduce, take } from 'rxjs/operators';
import { spatial } from '../actioners/spatial.actioner';
import { MovingAgent } from '../components/moving-agent.model';
import { GridPos } from '../components/position.model';
import { entitiesWithComponents } from '../mappers/entities-with-component.system';
import { scoreAction } from '../mappers/score-action.system';
import { assessBumpMove } from '../operators/bump-move.operator';
import { MoveOrder } from '../systems.types';
import { addProperty, radClone } from '../systems.utils';

export function allAgentUpdateFlow(em: EntityManager, rand: Chance.Chance) {
  const out = {
    start$: new Subject(),
    finish$: new Subject<(MoveOrder & { score: number | null })[]>()
  };

  out.start$
    .pipe(
      take(1),
      map(() => addProperty({}, 'componentTypes', [MovingAgent])),
      mergeMap(msg => of(...entitiesWithComponents(msg, em, 'agentId'))),
      mergeMap(msg =>
        of(msg).pipe(
          mergeMap(msg => {
            return of(
              ...xyPositionsAround(em.getComponent(msg.agentId, GridPos)).map(
                pos => ({
                  ...radClone(msg),
                  movingId: msg.agentId,
                  targetPos: pos
                })
              )
            );
          }),
          assessBumpMove(em, rand),
          map(msg => scoreAction(msg, em)),
          reduce(
            (acc, curr) => {
              return !acc || curr.score > acc.score ? curr : acc;
            },
            null as MoveOrder & { score: number | null }
          ),
          map(msg => spatial(msg, em))
        )
      ),
      reduce(
        (acc, curr) => {
          acc.push(curr);
          return acc;
        },
        [] as (MoveOrder & { score: number | null })[]
      )
      // reduce summary messages into an array of messages
    )
    .subscribe(out.finish$);

  return out;
}
