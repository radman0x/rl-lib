import { EntityManager } from 'rad-ecs';
import { AreaResolver } from './area-resolver.model';

export function moveRequestFlow(em: EntityManager) {
  // const flowPoints = {
  //   moveFlowStart$: new Subject<CanOccupyPositionArgs & CanStandAtArgs>(),
  //   moveAssessed$: new Subject<
  //     ProtagonistEntity &
  //       CanStandAtOut &
  //       CanOccupyPositionOut &
  //       PositionBlockedOut &
  //       TargetPos
  //   >(),
  //   positionEntered$: new Subject<ProtagonistEntity & EnteredPos>(),
  //   moveFailed$: new Subject<ProtagonistEntity>(),
  //   entitiesAtNewPos$: new Subject<ProtagonistEntity & TargetEntity>(),
  //   noteworthyAtNewPos$: new Subject<(ProtagonistEntity & TargetEntity)[]>(),
  //   moveComplete$: new Subject<ProtagonistEntity>()
  // };
  // flowPoints.moveFlowStart$
  //   .pipe(gatherBumpInfo(em))
  //   .subscribe(flowPoints.moveAssessed$);
  // flowPoints.moveAssessed$
  //   .pipe(filter(cannotOccupyStandOrIsBlocked))
  //   .subscribe(flowPoints.moveComplete$);
  // flowPoints.moveAssessed$
  //   .pipe(
  //     filter(canOccupyStandAndNotBlocked),
  //     map(msg => placeEntityAt(msg, em))
  //   )
  //   .subscribe(flowPoints.positionEntered$);
  // flowPoints.positionEntered$
  //   .pipe(tap(() => console.log(`Position entered`)))
  //   .subscribe(flowPoints.moveFailed$);
  // hookEntitiesAtProtagPos(
  //   flowPoints.positionEntered$,
  //   flowPoints.entitiesAtNewPos$,
  //   em
  // );
  // flowPoints.entitiesAtNewPos$
  //   .pipe(
  //     filter(msg => em.hasComponent(msg.targetId, Description)),
  //     reduce(
  //       (acc, curr) => {
  //         acc.push(curr);
  //         return acc;
  //       },
  //       [] as (ProtagonistEntity & TargetEntity)[]
  //     )
  //   )
  //   .subscribe(flowPoints.noteworthyAtNewPos$);
  // const moveRequestFlowFinished$ = new Subject();
  // const allFlowPoints = flowPoints;
  // merge(...Object.values(allFlowPoints)).subscribe({
  //   complete: () => {
  //     moveRequestFlowFinished$.next();
  //     moveRequestFlowFinished$.complete();
  //   }
  // });
  // return { ...allFlowPoints, moveRequestFlowFinished$ };
}

export function bumpMoveFlow(em: EntityManager, areaResolver: AreaResolver) {
  // const flowPoints = {
  //   bumpMoveStart$: new Subject<PositionNextToEntityArgs>(),
  //   combatTargetAssessed$: new Subject<
  //     Partial<CombatTargetEntity> & TargetPos & ProtagonistEntity
  //   >()
  // };
  // flowPoints.bumpMoveStart$
  //   .pipe(
  //     map(msg => positionNextToEntity(msg, em)),
  //     map(msg => acquireCombatTargetAtPosition(msg, em))
  //   )
  //   .subscribe(flowPoints.combatTargetAssessed$);
  // const moveOnlyFlow = moveRequestFlow(em);
  // flowPoints.combatTargetAssessed$
  //   .pipe(filter(noCombatTarget))
  //   .subscribe(moveOnlyFlow.moveFlowStart$);
  // const combatFlow = attackEntityFlow(em, areaResolver);
  // flowPoints.combatTargetAssessed$
  //   .pipe(filter(hasCombatTarget))
  //   .subscribe(combatFlow.combatStart$);
  // const bumpMoveFlowFinished$ = new Subject();
  // const allFlowPoints = { ...flowPoints, ...combatFlow, ...moveOnlyFlow };
  // merge(...Object.values(allFlowPoints)).subscribe({
  //   complete: () => {
  //     bumpMoveFlowFinished$.next();
  //     bumpMoveFlowFinished$.complete();
  //   }
  // });
  // return { ...allFlowPoints, bumpMoveFlowFinished$ };
}
