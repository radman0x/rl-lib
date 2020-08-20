import { EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { GridPos, GridPosData } from '../components/position.model';
import { Teleported } from '../systems.types';
import { actionEffectOutput } from './action-effect-output.operator';
describe('Action effect output', () => {
  let em: EntityManager;
  let start$: Subject<any>;
  let error: boolean | string;
  let out: any;
  let pos: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    start$ = new Subject();
    error = false;
    out = null;
    start$.pipe(actionEffectOutput(em)).subscribe({
      next: msg => (out = msg),
      error: err => (error = err)
    });
    pos = { x: 0, y: 0, z: 0 };
  });
  it('should action a teleport', () => {
    const teleport: Teleported = {
      teleport: { targetLocation: pos }
    };
    start$.next(teleport);
    expect(error).toEqual(false);
    expect(out).toMatchObject({});
  });
});
