import { Dialogue, GridPos } from '@rad/rl-ecs';
import { isValidId } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { NEVER, Observable, of } from 'rxjs';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { AcquireCombatTargetAtPositionArgs } from '../mappers/acquire-combat-target-at-position.system';
import { CanOccupyPositionArgs } from '../mappers/can-occupy-position.system';
import { CanStandAtArgs } from '../mappers/can-stand-at-position.system';
import {
  AggressorEntity,
  AttackOrder,
  Messages,
  MoveOrder,
  MovingEntity,
  TargetPos,
} from '../systems.types';
import { RadRxOperator } from '../systems.utils';

type MoveAssessment = CanOccupyPositionArgs & CanStandAtArgs & AcquireCombatTargetAtPositionArgs;

type Args = MovingEntity & TargetPos & AggressorEntity;

type AttemptMoveFlowArgs = {
  em: EntityManager;
  rand: Chance.Chance;
  gatherAttack: (
    em: EntityManager,
    rand: Chance.Chance
  ) => RadRxOperator<TargetPos & AggressorEntity, { attack: AttackOrder | null }>;
  gatherMove: (em: EntityManager) => RadRxOperator<MoveAssessment, { move: MoveOrder | null }>;
  processAttack: RadRxOperator<{ attack: AttackOrder | null }, any>;
  processMove: (em: EntityManager) => RadRxOperator<{ move: MoveOrder | null }, any>;
  processDialogue: (em: EntityManager) => RadRxOperator<{ dialogueId: EntityId | undefined }, any>;
  afterMove: (em: EntityManager) => RadRxOperator<Messages & MoveOrder, any>;
  afterAttack: (em: EntityManager) => RadRxOperator<Messages, any>;
  afterDialogue: (em: EntityManager) => RadRxOperator<any, any>;
  afterNeither?: () => RadRxOperator<any, any>;
};

export function attemptMoveFlow({
  em,
  rand,
  gatherAttack,
  gatherMove,
  processAttack,
  processMove,
  processDialogue,
  afterMove,
  afterAttack,
  afterDialogue,
  afterNeither,
}: AttemptMoveFlowArgs) {
  return <T extends Args>(input: Observable<T>) => {
    return input.pipe(
      gatherAttack(em, rand),
      mergeMap((msg) =>
        msg.attack
          ? of(msg).pipe(
              processAttack,
              afterAttack(em),
              mergeMap(() => NEVER)
            )
          : of(msg)
      ),
      map((msg) => {
        const dialogueId = em
          .matchingIndex(new GridPos(msg.targetPos))
          .filter((e) => e.has(Dialogue))
          .reduce((acc, curr) => curr, undefined)?.id;
        return { ...msg, dialogueId };
      }),
      mergeMap((msg) =>
        isValidId(msg.dialogueId)
          ? of(msg).pipe(
              processDialogue(em),
              afterDialogue(em),
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
      ),
      afterNeither ? afterNeither() : tap(() => null)
    );
  };
}
