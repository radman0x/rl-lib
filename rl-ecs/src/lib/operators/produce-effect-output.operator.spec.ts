import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { GridPos } from '../components/position.model';
import { Teleport } from '../components/teleport.model';
import { produceEffectOutput } from './produce-effect-output.operator';
import { ToggleLock } from '../components/toggle-lock.model';
import { reduce } from 'rxjs/operators';

import * as _ from 'lodash';

describe('Gather effect info', () => {
  let em: EntityManager;
  let start$: Subject<any>;
  let effectId: EntityId;
  let error: boolean | string;
  let out: any;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    start$ = new Subject();
    error = false;
    out = null;
    start$
      .pipe(produceEffectOutput(em))
      .pipe(
        reduce((acc, msg) => {
          _.merge(acc, msg);
          return acc;
        }, {})
      )
      .subscribe({
        next: msg => (out = msg),
        error: err => (error = err)
      });
  });

  it('should add the correct elements when the effect contains a teleport component', () => {
    const targetPos = { x: 1, y: 1, z: 1 };
    effectId = em.create(new Teleport({ target: targetPos })).id;
    start$.next({ effectId });
    start$.complete();

    expect(error).toEqual(false);
    expect(out).toMatchObject({
      teleport: { targetLocation: targetPos }
    });
  });

  it('should add the correct elements when the effect contains a toggle lock component', () => {
    const lockId = 'example';
    effectId = em.create(new ToggleLock({ lockId })).id;
    start$.next({ effectId });
    start$.complete();
    expect(error).toEqual(false);
    expect(out).toMatchObject({
      lockChange: { lockId }
    });
  });
});
