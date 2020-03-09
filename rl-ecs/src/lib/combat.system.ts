import { EntityManager } from 'rad-ecs';
import { Subject, merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  strikeFailure,
  strikeSuccess,
  woundFailure,
  woundSuccess
} from './systems.utils';
import { AreaResolver } from './area-resolver.model';
import { modifyActionFlow, processActionFlow } from './effects.system';
import {
  CombatResult,
  CombatTarget,
  Damaged,
  DamageType,
  ProtagonistEntity,
  StrikeResult,
  TargetEntity,
  WoundResult,
  WoundsInflicted
} from './systems.types';
import { resolveMeleeAttackDamage } from './systems/resolve-melee-attack-damage.system';
import { resolveStrike } from './systems/resolve-strike.system';
import { resolveWound } from './systems/resolve-wound.system';

export function attackEntityFlow(
  em: EntityManager,
  areaResolver: AreaResolver
) {
  const flowPoints = {
    combatStart$: new Subject<CombatTarget & ProtagonistEntity>(),
    strikeResolved$: new Subject<
      CombatTarget & ProtagonistEntity & StrikeResult
    >(),
    woundResolved$: new Subject<
      CombatTarget & ProtagonistEntity & WoundResult & StrikeResult
    >(),
    combatResolved$: new Subject<
      CombatTarget &
        ProtagonistEntity &
        WoundsInflicted &
        WoundResult &
        StrikeResult
    >(),
    combatResult$: new Subject<CombatResult>()
  };
  flowPoints.combatStart$
    .pipe(map(msg => resolveStrike(msg, em)))
    .subscribe(flowPoints.strikeResolved$);

  // strike failed
  flowPoints.strikeResolved$
    .pipe(filter(strikeFailure))
    .subscribe(flowPoints.combatResult$);

  // strike succeeded
  flowPoints.strikeResolved$
    .pipe(
      filter(strikeSuccess),
      map(msg => resolveWound(msg, em))
    )
    .subscribe(flowPoints.woundResolved$);

  // wound failed
  flowPoints.woundResolved$
    .pipe(filter(woundFailure))
    .subscribe(flowPoints.combatResult$);

  // wound succeeded
  const modActionFlow = modifyActionFlow(em);
  flowPoints.woundResolved$
    .pipe(
      filter(woundSuccess),
      map(msg => resolveMeleeAttackDamage(msg, em))
    )
    .subscribe(flowPoints.combatResolved$);

  flowPoints.combatResolved$.subscribe(flowPoints.combatResult$);

  flowPoints.combatResolved$
    .pipe(
      map(msg => ({
        ...msg,
        damage: { type: DamageType.PHYSICAL, amount: msg.woundsInflicted },
        targetId: msg.combatTargetId
      }))
    )
    .subscribe(modActionFlow.actionInput$);

  const procActionFlow = processActionFlow(em, areaResolver);
  modActionFlow.actionModified$.subscribe(procActionFlow.processAction$);

  const combatFlowFinished$ = new Subject();
  const allFlowPoints = { ...flowPoints, ...modActionFlow, ...procActionFlow };
  merge(...Object.values(allFlowPoints)).subscribe({
    complete: () => {
      combatFlowFinished$.next();
      combatFlowFinished$.complete();
    }
  });

  return { ...allFlowPoints, combatFlowFinished$ };
}