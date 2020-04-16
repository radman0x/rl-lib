import { d10 } from '@rad/rl-utils';
import { EntityManager } from 'rad-ecs';
import { Martial } from '../components/martial.model';
import { OperationStep } from '../operation-step.model';
import {
  CombatTargetEntity,
  ProtagonistEntity,
  WoundResult
} from '../systems.types';
import { radClone } from '../systems.utils';
import * as Chance from 'chance';

type Args = ProtagonistEntity & CombatTargetEntity;
export type ResolveWoundArgs = Args;

type Out = WoundResult;
export type ResolveWoundOut = Out;

function resolveWoundStep<T extends Args>(
  msg: T,
  em: EntityManager,
  rand: Chance.Chance
): T & Out {
  if (msg.combatTargetId === null) {
    return { ...radClone(msg), woundSuccess: null };
  }
  const protagMartial = em.getComponent(msg.protagId, Martial);
  const targetMartial = em.getComponent(msg.combatTargetId, Martial);
  const BASE_TO_WOUND = 6;
  const stDiff = protagMartial.strength - targetMartial.toughness;
  const actualToWound = BASE_TO_WOUND - stDiff;
  const woundRoll = rand.d10();
  let woundSuccess = false;
  if (woundRoll === 10) {
    woundSuccess = true;
  } else if (woundRoll === 1) {
    woundSuccess = false;
  } else {
    woundSuccess = woundRoll >= actualToWound;
  }
  console.log(`Wound resolved as a ${woundSuccess}`);
  return { ...radClone(msg), woundSuccess };
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = resolveWoundStep;

export const resolveWound = typeCheck as typeof resolveWoundStep;
