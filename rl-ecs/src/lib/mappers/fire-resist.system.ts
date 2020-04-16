import * as cloneDeep from 'clone-deep';
import { EntityManager } from 'rad-ecs';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DamageData } from '../components/damage.model';
import { FireResistance } from '../components/resistance.model';
import { OperationStep } from '../operation-step.model';
import { DamageType, TargetEntity } from '../systems.types';
import { hasDamage, radClone } from '../systems.utils';

type HookFireArgs = { damage?: DamageData } & TargetEntity;

export function attachFireResist<T extends HookFireArgs>(
  source: Observable<T>,
  em: EntityManager
) {
  return source.pipe(
    filter(hasDamage),
    filter(msg => em.hasComponent(msg.targetId, FireResistance)),
    map(msg => fireResist(msg, em))
  );
}

type Args = HookFireArgs;
export type FireResistArgs = Args;

interface Out {}
export type FireResistOut = Out;

function fireResistStep<T extends Args>(msg: T, em: EntityManager): T & Out {
  if (!msg.damage) {
    return msg;
  }
  const resist = em.getComponent(msg.targetId, FireResistance);
  if (resist) {
    console.log(`FIRE RESIST: Target has fire resistance!`);
  }
  if (resist && msg.damage.type === DamageType.FIRE) {
    const finalDamage = msg.damage.amount - resist.factor;
    if (finalDamage <= 0) {
      console.log(`FIRE RESIST: Damage reduced to 0 or below, removing`);
      const clone = cloneDeep(msg);
      delete clone.damage;
      return clone;
    } else {
      console.log(`FIRE RESIST: Damage reduced to ${finalDamage}`);
      return {
        ...radClone(msg),
        damage: { type: msg.damage.type, amount: finalDamage }
      };
    }
  }
  return msg;
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = fireResistStep;

export const fireResist = typeCheck as typeof fireResistStep;
