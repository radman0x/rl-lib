import { Coord, xyPositionsAround } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { of, Subject, merge } from 'rxjs';
import { filter, map, mergeMap, reduce, tap } from 'rxjs/operators';
import { PlayerAgent } from './components/player-agent.model';
import { GridPos } from './components/position.model';
import { CombatTarget, ProtagonistEntity } from './systems.types';
import { radClone } from './systems.utils';
import { acquireCombatTargetAtPosition } from './systems/acquire-combat-target-at-position.system';
import { acquireEntityPosition } from './systems/acquire-entity-position.system';

function hasPlayerSearchPositions<T>(
  a: T
): a is T & { playerSearchPositions: Coord[] } {
  return a['playerSearchPositions'] && a['playerSearchPositions'].length !== 0;
}

function hasCombatTarget<T>(a: T): a is T & CombatTarget {
  return a && a['combatTargetId'] !== undefined;
}

function noCombatTarget<T>(a: T): a is T & Partial<CombatTarget> {
  return a && a['combatTargetId'] === undefined;
}

export function playerAdjacentForCombatFlow(em: EntityManager) {
  const flowPoints = {
    playerAdjacentForCombatStart$: new Subject<ProtagonistEntity>(),
    playerNotFound$: new Subject<ProtagonistEntity>(),
    playerAttackable$: new Subject<ProtagonistEntity & CombatTarget>(),
    positionsAcquired$: new Subject<
      ProtagonistEntity & { playerSearchPositions: Coord[] }
    >(),
    attackCandidatesAcquired$: new Subject<
      ProtagonistEntity & Partial<CombatTarget>
    >()
  };

  flowPoints.playerAdjacentForCombatStart$
    .pipe(
      tap(msg => console.log(`A`)),
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
      tap(msg => console.log(`C`)),
      filter(hasPlayerSearchPositions),
      tap(msg => console.log(`D`)),
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
        [] as (ProtagonistEntity & Partial<CombatTarget>)[]
      ),
      mergeMap(msg => of(...msg))
    )
    .subscribe(flowPoints.attackCandidatesAcquired$);

  flowPoints.attackCandidatesAcquired$
    .pipe(
      filter(hasCombatTarget),
      tap(msg => console.log(`G`))
    )
    .subscribe(flowPoints.playerAttackable$);

  flowPoints.attackCandidatesAcquired$
    .pipe(
      filter(noCombatTarget),
      tap(msg => console.log(`F: ${JSON.stringify(msg, null, 2)}`))
    )
    .subscribe(flowPoints.playerNotFound$);

  flowPoints.positionsAcquired$
    .pipe(
      filter(msg => msg.playerSearchPositions.length === 0),
      tap(msg => console.log(`B`))
    )
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

// filter(hasCombatTarget),
// tap(msg => em.getComponent(msg.combatTargetId, DistanceMap).map)
