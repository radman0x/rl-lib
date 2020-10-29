import { EntityManager } from 'rad-ecs';
import { EndType } from '../components/end-state.model';
import { OperationStep } from '../operation-step.model';

import * as _ from 'lodash';
import { EffectReport, GameEnded } from '../systems.types';
import { radClone } from '../systems.utils';

type Args = Partial<EffectReport> & Partial<GameEnded>;
export type EndStateArgs = Args;

type Out = EffectReport;
export type EndStateOut = Out;

function endStateStep<T extends Args>(
  msg: T,
  em: EntityManager,
  ender: (et: EndType) => void
): T & Out {
  let out = { ...radClone(msg) };
  if (msg.endType !== null && msg.endType !== undefined) {
    ender(msg.endType);
    _.set(
      out,
      'effectReport.endState.worldStateChangeDescription',
      `GAME ENDED!!`
    );
  }
  return out as T & Out;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = endStateStep;

export const endState = typeCheck as typeof endStateStep;
