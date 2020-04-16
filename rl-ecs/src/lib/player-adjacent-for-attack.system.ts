import { Coord, xyPositionsAround } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { merge, of, Subject } from 'rxjs';
import { filter, map, mergeMap, reduce } from 'rxjs/operators';
import { PlayerAgent } from './components/player-agent.model';
import { GridPos } from './components/position.model';
import { CombatTargetEntity, ProtagonistEntity } from './systems.types';
import { radClone } from './systems.utils';
import { acquireCombatTargetAtPosition } from './mappers/acquire-combat-target-at-position.system';
import { acquireEntityPosition } from './mappers/acquire-entity-position.system';

function hasPlayerSearchPositions<T>(
  a: T
): a is T & { playerSearchPositions: Coord[] } {
  return a['playerSearchPositions'] && a['playerSearchPositions'].length !== 0;
}

function hasCombatTarget<T>(a: T): a is T & CombatTargetEntity {
  return a && a['combatTargetId'] !== undefined;
}

function noCombatTarget<T>(a: T): a is T & Partial<CombatTargetEntity> {
  return a && a['combatTargetId'] === undefined;
}

export function playerAdjacentForCombatFlow(em: EntityManager) {
  const flowPoints = {
    playerAdjacentForCombatStart$: new Subject<ProtagonistEntity>(),
    playerNotFound$: new Subject<ProtagonistEntity>(),
    playerAttackable$: new Subject<ProtagonistEntity & CombatTargetEntity>(),
    positionsAcquired$: new Subject<
      ProtagonistEntity & { playerSearchPositions: Coord[] }
    >(),
    attackCandidatesAcquired$: new Subject<
      ProtagonistEntity & Partial<CombatTargetEntity>
    >()
  };

  flowPoints.playerAdjacentForCombatStart$
    .pipe(
      map(msg => acquireEntityPosition(msg, em)),
      map(msg =>
        radClone({
          ...radClone(msg),
          selectedPos: msg.targetPos,
          areaOfEffect: { radius: 1 }
        })
      ),
      map(msg => ({
        ...radClone(msg),
        playerSearchPositions: xyPositionsAround(msg.targetPos)
      }))
    )
    .subscribe(flowPoints.positionsAcquired$);

  flowPoints.positionsAcquired$
    .pipe(
      filter(hasPlayerSearchPositions),
      mergeMap(msg =>
        of(
          ...msg.playerSearchPositions.map(p => ({
            ...radClone(msg),
            targetPos: new GridPos(p)
          }))
        )
      ),
      map(msg =>
        acquireCombatTargetAtPosition(msg, em, e => e.has(PlayerAgent))
      ),
      reduce(
        (acc, msg) => {
          if (acc[0] && acc[0].combatTargetId) {
          } else {
            acc.push(msg);
            if (acc.length === 2) {
              acc = [acc[1]];
            }
          }
          return acc;
        },
        [] as (ProtagonistEntity & Partial<CombatTargetEntity>)[]
      ),
      mergeMap(msg => of(...msg))
    )
    .subscribe(flowPoints.attackCandidatesAcquired$);

  flowPoints.attackCandidatesAcquired$
    .pipe(filter(hasCombatTarget))
    .subscribe(flowPoints.playerAttackable$);

  flowPoints.attackCandidatesAcquired$
    .pipe(filter(noCombatTarget))
    .subscribe(flowPoints.playerNotFound$);

  flowPoints.positionsAcquired$
    .pipe(filter(msg => msg.playerSearchPositions.length === 0))
    .subscribe(flowPoints.playerNotFound$);

  const playerAdjacentAcquireFinished$ = new Subject();
  const allFlowPoints = flowPoints;
  merge(...Object.values(allFlowPoints)).subscribe({
    complete: () => {
      playerAdjacentAcquireFinished$.next();
      playerAdjacentAcquireFinished$.complete();
    }
  });
  return { ...flowPoints, playerAdjacentAcquireFinished$ };
}
