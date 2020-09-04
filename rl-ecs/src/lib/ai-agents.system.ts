// import { EntityManager, EntityId } from 'rad-ecs';
// import { Subject, of, merge } from 'rxjs';
// import { ProtagonistEntity, TargetPos } from './systems.types';
// import { map, filter, tap, mergeMap, reduce } from 'rxjs/operators';
// import { MovingAgent } from './components/moving-agent.model';
// import { AttackingAgent } from './components/attacking-agent.model';
// import { acquireEntityPosition } from './mappers/acquire-entity-position.system';
// import { acquireAoePositions } from './mappers/acquire-aoe-targets.system';
// import { acquireCombatTargetAtPosition } from './mappers/acquire-combat-target-at-position.system';
// import { PlayerAgent } from './components/player-agent.model';
// import { Description } from './components/description.model';
// import { EndType } from './components/end-state.model';
// import { xyPositionsAround } from '@rad/rl-utils';
// import {
//   notAttackingAI,
//   radClone,
//   isAttackingAI,
//   hasCombatTarget
// } from './systems.utils';
// import { attackEntityFlow } from './combat.system';
// import { moveRequestFlow } from './movement.system';
// import { DistanceMap } from './components/distance-map.model';
// import { AreaResolver } from './utils/area-resolver.util';
// import { playerAdjacentForCombatFlow } from './player-adjacent-for-attack.system';
// import { GridPos, GridPosData } from './components/position.model';

// export function aiTurnFlow(
//   em: EntityManager,
//   areaResolver: AreaResolver,
//   ender: (et: EndType) => void,
//   logger: (s: string) => void,
//   playerId: EntityId
// ) {
//   const flowPoints = {
//     aiTurnStart$: new Subject<ProtagonistEntity>(),
//     movingAI$: new Subject<ProtagonistEntity & { acted?: boolean }>(),
//     moveCandidateSelected$: new Subject<
//       ProtagonistEntity &
//         TargetPos & { moveCandidate: GridPosData; moveScore: number }
//     >()
//   };
//   flowPoints.aiTurnStart$.subscribe(msg =>
//     console.log(`AI agent: ${msg.protagId} being processed`)
//   );
//   const combatFlow = attackEntityFlow(em, areaResolver);
//   const moveFlow = moveRequestFlow(em);
//   const playerAcquired = playerAdjacentForCombatFlow(em);
//   flowPoints.aiTurnStart$
//     .pipe(filter(msg => em.hasComponent(msg.protagId, AttackingAgent)))
//     .subscribe(playerAcquired.playerAdjacentForCombatStart$);
//   flowPoints.aiTurnStart$
//     .pipe(filter(msg => !em.hasComponent(msg.protagId, AttackingAgent)))
//     .subscribe(flowPoints.movingAI$);
//   playerAcquired.playerAttackable$.subscribe(combatFlow.combatStart$);
//   combatFlow.combatResult$
//     .pipe(map(msg => ({ ...radClone(msg), acted: true })))
//     .subscribe(flowPoints.movingAI$);
//   playerAcquired.playerNotFound$.subscribe(flowPoints.movingAI$);
//   combatFlow.combatResult$.subscribe(msg => {
//     console.log(`Combat result for AI -> ${JSON.stringify(msg, null, 2)}`);
//     const pluraler = (n: number) => (n === 1 ? '' : 's');
//     const attackerDescription = em.hasComponent(msg.protagId, Description)
//       ? em.getComponent(msg.protagId, Description).short
//       : 'unnamed';
//     if (msg.woundSuccess) {
//       logger(
//         `The ${attackerDescription} hits you and inflicts ${
//           msg.woundsInflicted
//         } wound${pluraler(msg.woundsInflicted)}`
//       );
//     } else if (msg.strikeSuccess) {
//       logger(
//         `The ${attackerDescription} hits you but fails to cause any damage`
//       );
//     } else {
//       logger(`The ${attackerDescription} misses you`);
//     }
//   });
//   combatFlow.reapedEntity$.subscribe(msg => {
//     console.log(
//       `The entity was reaped: ${msg.reapedEntity} checking for player`
//     );
//     if (msg.reapedEntity.id === playerId) {
//       console.log(`Player entity was reaped! Ending the game in defeat!!`);
//       ender(EndType.DEFEAT);
//     }
//   });
//   flowPoints.movingAI$
//     .pipe(
//       tap(msg => console.log(`Moving AI`)),
//       filter(msg => !msg.acted),
//       map(msg => {
//         const player = em.matching(PlayerAgent)[0];
//         const distanceMap = player.component(DistanceMap);
//         return { ...radClone(msg), distanceMap };
//       }),
//       filter(msg => {
//         const protagPos = em.getComponent(msg.protagId, GridPos);
//         return msg.distanceMap.map.get(protagPos) !== undefined;
//       }),
//       mergeMap(msg => {
//         return of(
//           ...xyPositionsAround(em.getComponent(msg.protagId, GridPos)).map(
//             pos => ({ ...radClone(msg), moveCandidate: pos })
//           )
//         );
//       }),
//       filter(
//         msg =>
//           msg.distanceMap.map.get(new GridPos(msg.moveCandidate)) !== undefined
//       ),
//       map(msg => ({
//         ...radClone(msg),
//         moveScore: msg.distanceMap.map.get(new GridPos(msg.moveCandidate))
//       })),
//       reduce((best, candidate) => {
//         console.log(
//           `Checking candidate: ${JSON.stringify(candidate, null, 2)}`
//         );
//         if (best === null && candidate.moveScore !== 0) {
//           return candidate;
//         }
//         if (candidate.moveScore === 0) {
//           return best;
//         }
//         return candidate.moveScore < best.moveScore
//           ? { ...radClone(candidate) }
//           : { ...radClone(best) };
//       }, null)
//     )
//     .subscribe(flowPoints.moveCandidateSelected$);
//   flowPoints.moveCandidateSelected$
//     .pipe(
//       filter(msg => msg !== null),
//       tap(msg => console.log(`Best move candidate: ${msg.moveScore}`)),
//       map(msg => ({ ...radClone(msg), targetPos: msg.moveCandidate }))
//     )
//     .subscribe(moveFlow.moveFlowStart$);
//   const aiTurnFinished$ = new Subject();
//   const allFlowPoints = {
//     ...flowPoints,
//     ...playerAcquired,
//     ...moveFlow,
//     ...combatFlow
//   };
//   merge(...Object.values(allFlowPoints)).subscribe({
//     complete: () => {
//       aiTurnFinished$.next();
//       aiTurnFinished$.complete();
//     }
//   });
//   return { ...allFlowPoints, aiTurnFinished$ };
// }
