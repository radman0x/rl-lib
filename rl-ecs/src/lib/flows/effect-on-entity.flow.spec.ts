import { EntityId, EntityManager } from 'rad-ecs';
import { GridPosData } from '../components/position.model';
import { Teleport } from '../components/teleport.model';
import { Descriptions, effectOnEntityFlow } from './effect-on-entity.flow';
describe('Effect on Entity', () => {
  let em: EntityManager;
  let results: {
    outcome: any;
    finished: boolean;
    descriptions: Descriptions[] | null;
    error: boolean | string;
  };
  const newFlow = (em: EntityManager) => {
    const flow = effectOnEntityFlow(em);
    flow.finish$.subscribe({
      next: msg => {
        results.outcome = msg;
      },
      error: err => (results.error = err)
    });
    flow.stateChangeSummary$.subscribe(msg => (results.descriptions = msg));
    return flow;
  };
  let effectTargetId: EntityId;
  let process: ReturnType<typeof newFlow>;
  let targetPos: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    results = {
      outcome: null,
      finished: false,
      descriptions: null,
      error: false
    };
    process = newFlow(em);
    effectTargetId = em.create().id;
    targetPos = { x: 1, y: 1, z: 1 };
  });

  it('should produce an event when an effect action successfully changes the world state', () => {
    const effectId = em.create(new Teleport({ target: targetPos })).id;
    process.start$.next({ effectTargetId, effectId });
    expect(results.error).toBe(false);
    expect(results.descriptions.length).toEqual(1);
  });

  it('should behave well if the input effect contains no components', () => {
    const effectId = em.create().id;
    process.start$.next({ effectTargetId, effectId });
    expect(results.error).toBe(false);
    expect(results.descriptions).toEqual(null); // no change description received
  });
});
