import { EntityManager } from 'rad-ecs';

describe('Produce effect output', () => {
  let em: EntityManager;
  let results: {
    outcome: any;
    finished: boolean;
    descriptions: string[];
    error: boolean | string;
  };
  const newFlow = (em: EntityManager) => {
    const flow = produceEffectOutcome(em);
    flow.finish$.subscribe({
      next: msg => {
        results.outcome = msg;
      },
      error: err => (results.error = err)
    });
    return flow;
  };
  let process: ReturnType<typeof newFlow>;
  beforeEach(() => {
    em = new EntityManager();
    results = {
      outcome: false,
      finished: false,
      descriptions: [],
      error: false
    };
    process = newFlow(em);
  });

  it('should produce a single event for an effect', () => {});

  it('should produce two output events for an effect', () => {});
});
