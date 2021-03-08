import * as Chance from 'chance';
import { EntityManager } from 'rad-ecs';
import { Observable, of } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';
import { attemptMoveFlow } from './bump-move.flow';

function mockObs(value: any) {
  const bodyFn = jest.fn();
  const operatorFn = jest.fn((input: Observable<any>) => {
    console.log(input);
    return input.pipe(
      tap(() => bodyFn()),
      mapTo(value)
    );
  });
  const factoryFn = jest.fn(() => {
    return operatorFn;
  });
  return { operatorFn, factoryFn, bodyFn };
}

describe('Bump move flow', () => {
  let em: EntityManager;
  let rand: Chance.Chance;

  beforeEach(() => {
    em = new EntityManager();
    rand = new Chance();
  });

  it('should process an attack if a possible one is found', () => {
    const data = {
      movingId: 0,
      targetPos: { x: 0, y: 0, z: 0 },
    };
    const gatherAttack = mockObs({ attack: { wound: true } });
    const gatherMove = mockObs(null);
    const processAttack = mockObs(null);
    const processMove = mockObs(null);
    const afterMove = mockObs(null);
    const afterAttack = mockObs(null);
    const processNeither = mockObs(null);
    of(data)
      .pipe(
        attemptMoveFlow({
          em,
          rand,
          gatherAttack: gatherAttack.factoryFn,
          gatherMove: gatherMove.factoryFn,
          processAttack: processAttack.factoryFn,
          processMove: processMove.factoryFn,
          afterMove: afterMove.factoryFn,
          afterAttack: afterAttack.factoryFn,
          afterNeither: processNeither.factoryFn,
        })
      )
      .subscribe();
    expect(gatherAttack.bodyFn).toHaveBeenCalled();
    expect(processAttack.bodyFn).toHaveBeenCalled();
    expect(afterAttack.bodyFn).toHaveBeenCalled();
    expect(processNeither.bodyFn).not.toHaveBeenCalled();
    expect(gatherMove.bodyFn).not.toHaveBeenCalled();
    expect(processMove.bodyFn).not.toHaveBeenCalled();
    expect(afterMove.bodyFn).not.toHaveBeenCalled();
  });
});
