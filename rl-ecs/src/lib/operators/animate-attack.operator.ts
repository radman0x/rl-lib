import { AttackOrder, ProcessAttackArgs } from '@rad/rl-ecs';
import { EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { mapTo, mergeMap } from 'rxjs/operators';

export type AnimateAttackArgs = { attack: AttackOrder | null };

export type AnimateAttackCb = (
  details: { em: EntityManager } & Pick<AttackOrder, 'combatTargetId' | 'damage' | 'reapedId'>
) => Observable<void>;

export function animateAttack(em: EntityManager, playAnimation: AnimateAttackCb) {
  return <T extends ProcessAttackArgs>(input: Observable<T>) => {
    return input.pipe(
      mergeMap((msg) => {
        return msg.attack
          ? of(msg).pipe(
              mergeMap((msg) => {
                return playAnimation({ em, ...msg.attack }).pipe(mapTo(msg));
              })
            )
          : of(msg);
      })
    );
  };
}
