import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { GridPos } from '../components/position.model';
import { Teleport } from '../components/teleport.model';
import { produceEffectOutput } from './produce-effect-output.operator';

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
    start$.pipe(produceEffectOutput(em)).subscribe({
      next: msg => (out = msg),
      error: err => (error = err)
    });
  });

  it('should add the correct elements when the effect contains a teleport component', () => {
    const targetPos = { x: 1, y: 1, z: 1 };
    effectId = em.create(new Teleport({ target: targetPos })).id;
    start$.next({ effectId });

    expect(error).toEqual(false);
    expect(out).toMatchObject({
      teleport: { targetLocation: targetPos }
    });
  });
});
