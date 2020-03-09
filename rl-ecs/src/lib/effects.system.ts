import { EntityManager } from 'rad-ecs';
import { merge, Subject } from 'rxjs';
import { filter, map, reduce } from 'rxjs/operators';
import {
  hasAreaTransition,
  hasDamage,
  hasLockChange,
  hasOutcomeDescription,
  hasReaped,
  hasSpatialChange
} from './systems.utils';
import { AreaResolver } from './area-resolver.model';
import { EndType } from './components/end-state.model';
import {
  ActiveEffect,
  Damaged,
  EffectStart,
  ReapedEntity,
  TargetEntity,
  TargetPos,
  Teleported
} from './systems.types';
import { hookAoeTarget } from './systems/acquire-aoe-targets.system';
import { area } from './systems/area.system';
import { burn } from './systems/burn.system';
import { endState } from './systems/end-state.system';
import { hookEntitiesAtPosition } from './systems/entities-at-position.system';
import { fireResist } from './systems/fire-resist.system';
import { freeze } from './systems/freeze.system';
import { grimReaper } from './systems/grim-reaper.system';
import { integrity } from './systems/integrity.system';
import { lockQuality } from './systems/lock-quality.system';
import { lock } from './systems/lock.system';
import { hookSingleTarget } from './systems/single-target.system';
import { spatial } from './systems/spatial.system';
import { teleport } from './systems/teleport.system';
import { toggleLock } from './systems/toggle-lock.system';
import {
  transitionArea,
  TransitionAreaOut
} from './systems/transition-area.system';

export function applyTargetedEffectFlow(
  em: EntityManager,
  areaResolver: AreaResolver,
  ender: (et: EndType) => void
) {
  const flowPoints = {
    applyTargetedEffect$: new Subject<EffectStart>(),
    effectAtPosition$: new Subject<TargetPos & ActiveEffect>(),
    effectOnEntity$: new Subject<TargetEntity & ActiveEffect>(),
    outcomeDescriptions$: new Subject<
      {
        worldStateChangeDescription: string;
        activeEffectDescription: string;
      }[]
    >()
  };
  hookSingleTarget(
    flowPoints.applyTargetedEffect$,
    flowPoints.effectAtPosition$,
    em
  );
  hookAoeTarget(
    flowPoints.applyTargetedEffect$,
    flowPoints.effectAtPosition$,
    em
  );
  hookEntitiesAtPosition(
    flowPoints.effectAtPosition$,
    flowPoints.effectOnEntity$,
    em
  );

  const modifyFlow = modifyActionFlow(em);
  merge(
    flowPoints.effectOnEntity$.pipe(map(msg => endState(msg, em, ender))),
    flowPoints.effectOnEntity$.pipe(map(msg => burn(msg, em))),
    flowPoints.effectOnEntity$.pipe(map(msg => freeze(msg, em))),
    flowPoints.effectOnEntity$.pipe(map(msg => toggleLock(msg, em))),
    flowPoints.effectOnEntity$.pipe(map(msg => teleport(msg, em))),
    flowPoints.effectOnEntity$.pipe(map(msg => transitionArea(msg, em)))
  ).subscribe(modifyFlow.actionInput$);

  const actionFlow = processActionFlow(em, areaResolver);
  modifyFlow.actionModified$.subscribe(actionFlow.processAction$);

  merge(actionFlow.lockStateChanged$, actionFlow.areaTransitioned$)
    .pipe(
      filter(hasOutcomeDescription),
      reduce(
        (acc, curr) => {
          acc.push(curr);
          return acc;
        },
        [] as {
          activeEffectDescription: string;
          worldStateChangeDescription: string;
        }[]
      )
    )
    .subscribe(flowPoints.outcomeDescriptions$);

  return { ...flowPoints, ...modifyFlow, ...actionFlow };
}

export function processActionFlow(
  em: EntityManager,
  areaResolver: AreaResolver
) {
  const flowPoints = {
    processAction$: new Subject<
      TargetEntity & ActiveEffect & Damaged & Teleported
    >(),
    integrityModified$: new Subject<TargetEntity>(),
    lockStateChanged$: new Subject<any>(),
    areaTransitioned$: new Subject<
      Damaged &
        TargetEntity &
        ActiveEffect &
        Teleported &
        Required<TransitionAreaOut>
    >(),
    spatialChanged$: new Subject<TargetEntity & Required<Teleported>>(),
    reapedEntity$: new Subject<ReapedEntity>(),
    actionFlowResult$: new Subject<any[]>()
  };
  flowPoints.processAction$
    .pipe(
      filter(hasDamage),
      map(msg => integrity(msg, em))
    )
    .subscribe(flowPoints.integrityModified$);

  flowPoints.integrityModified$
    .pipe(
      map(msg => grimReaper(msg, em)),
      filter(hasReaped)
    )
    .subscribe(flowPoints.reapedEntity$);

  flowPoints.processAction$
    .pipe(
      filter(hasLockChange),
      map(msg => lock(msg, em))
    )
    .subscribe(flowPoints.lockStateChanged$);

  flowPoints.processAction$
    .pipe(
      filter(hasSpatialChange),
      map(msg => spatial(msg, em))
    )
    .subscribe(flowPoints.spatialChanged$);

  flowPoints.processAction$
    .pipe(
      filter(hasAreaTransition),
      map(msg => area(msg, em, areaResolver))
    )
    .subscribe(flowPoints.areaTransitioned$);

  merge(
    flowPoints.integrityModified$,
    flowPoints.areaTransitioned$,
    flowPoints.spatialChanged$
  )
    .pipe(
      reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, [])
    )
    .subscribe(flowPoints.actionFlowResult$);

  const processActionFlowFinished$ = new Subject();
  const allFlowPoints = flowPoints;
  merge(...Object.values(allFlowPoints)).subscribe({
    complete: () => {
      processActionFlowFinished$.next();
      processActionFlowFinished$.complete();
    }
  });

  return flowPoints;
}

export function modifyActionFlow(em: EntityManager) {
  const flowPoints = {
    actionInput$: new Subject<TargetEntity & Damaged & Teleported>(),
    actionModified$: new Subject<TargetEntity & Damaged & Teleported>()
  };
  flowPoints.actionInput$
    .pipe(
      map(msg => lockQuality(msg, em)),
      map(msg => fireResist(msg, em))
    )
    .subscribe(flowPoints.actionModified$);

  const modifyActionFlowFinished$ = new Subject();
  const allFlowPoints = flowPoints;
  merge(...Object.values(allFlowPoints)).subscribe({
    complete: () => {
      modifyActionFlowFinished$.next();
      modifyActionFlowFinished$.complete();
    }
  });
  return { ...allFlowPoints, modifyActionFlowFinished$ };
}
