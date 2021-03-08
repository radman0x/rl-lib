import { EntityManager } from 'rad-ecs';
import { Observable, of, NEVER } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AcquireCombatTargetAtPositionArgs } from '../mappers/acquire-combat-target-at-position.system';
import { CanOccupyPositionArgs } from '../mappers/can-occupy-position.system';
import { CanStandAtArgs } from '../mappers/can-stand-at-position.system';
import {
  MovingEntity,
  TargetPos,
  AttackOrder,
  MoveOrder,
  AggressorEntity,
  WorldStateChangeReport,
  SpatialReport,
} from '../systems.types';
import { RadRxOperator } from '../systems.utils';

type MoveAssessment = CanOccupyPositionArgs &
  CanStandAtArgs &
  AcquireCombatTargetAtPositionArgs;

type Args = MovingEntity & TargetPos & AggressorEntity;

type AttemptMoveFlowArgs = {
  em: EntityManager;
  rand: Chance.Chance;
  gatherAttack: (
    em: EntityManager,
    rand: Chance.Chance
  ) => RadRxOperator<
    TargetPos & AggressorEntity,
    { attack: AttackOrder | null }
  >;
  gatherMove: (
    em: EntityManager
  ) => RadRxOperator<MoveAssessment, { move: MoveOrder | null }>;
  processAttack: (
    em: EntityManager
  ) => RadRxOperator<{ attack: AttackOrder | null }, any>;
  processMove: (
    em: EntityManager
  ) => RadRxOperator<{ move: MoveOrder | null }, any>;
  afterMove: (em: EntityManager) => RadRxOperator<any, any>;
  afterAttack: (em: EntityManager) => RadRxOperator<any, any>;
  afterNeither?: () => RadRxOperator<any, any>;
};

export function attemptMoveFlow({
  em,
  rand,
  gatherAttack,
  gatherMove,
  processAttack,
  processMove,
  afterMove,
  afterAttack,
  afterNeither,
}: AttemptMoveFlowArgs) {
  return <T extends Args>(input: Observable<T>) => {
    return input.pipe(
      gatherAttack(em, rand),
      mergeMap((msg) =>
        msg.attack
          ? of(msg).pipe(
              processAttack(em),
              afterAttack(em),
              mergeMap(() => NEVER)
            )
          : of(msg)
      ),
      gatherMove(em),
      mergeMap((msg) =>
        msg.move
          ? of(msg).pipe(
              processMove(em),
              afterMove(em),
              mergeMap(() => NEVER)
            )
          : of(msg)
      )
    );
  };
}
