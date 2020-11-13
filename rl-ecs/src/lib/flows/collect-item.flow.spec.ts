import { EntityManager, EntityId, Component } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { Inventory } from '../components/inventory.model';
import { Physical, Size } from '../components/physical.model';
import { Fixed } from '../components/fixed.model';
import { collectItemFlow } from './collect-item.flow';

describe('Collect item flow', () => {
  let em: EntityManager;
  let collectorId: EntityId;
  let collectPos: { x: number; y: number; z: number };
  let emptyPos: { x: number; y: number; z: number };
  let baseItemComponents: Component[];
  let results: {
    collected: boolean;
    noCollection: boolean;
    finished: boolean;
    error: boolean | string;
  };
  let collectFlow: ReturnType<typeof collectItemFlow>;

  beforeEach(() => {
    results = {
      collected: false,
      noCollection: false,
      finished: false,
      error: false,
    };
    em = new EntityManager();
    em.indexBy(GridPos);
    collectFlow = collectItemFlow(em, 'test');
    collectFlow.itemsCollected$.subscribe(() => (results.collected = true));
    collectFlow.noItemsCollected$.subscribe(
      () => (results.noCollection = true)
    );
    collectFlow.finish$.subscribe({
      error: (err) => (results.error = err),
      complete: () => (results.finished = true),
    });

    emptyPos = { x: 1, y: 1, z: 1 };
    collectPos = { x: 1, y: 1, z: 1 };
    baseItemComponents = [new Physical({ size: Size.SMALL })];
    collectorId = em.create(new Inventory({ contents: [999] })).id;
  });

  it('should produce an event when there are no items to collect', () => {
    em.setComponent(collectorId, new GridPos(emptyPos));
    collectFlow.start$.next({ collectorId });
    expect(results).toEqual({
      noCollection: true,
      collected: false,
      finished: true,
      error: false,
    });
    expect(em.getComponent(collectorId, Inventory).contents.length).toEqual(1);
    expect(em.getComponent(collectorId, Inventory).contents[0]).toEqual(999);
  });

  it('should produce an event when items are collected', () => {
    em.setComponent(collectorId, new GridPos(collectPos));
    const collectId = em.create(...baseItemComponents, new GridPos(collectPos))
      .id;
    collectFlow.start$.next({ collectorId });
    expect(em.getComponent(collectorId, Inventory).contents).toEqual([
      999,
      collectId,
    ]);
    expect(results).toEqual({
      collected: true,
      noCollection: false,
      finished: true,
      error: false,
    });
  });

  it('should fail to collect an entity with the Fixed component', () => {
    em.setComponent(collectorId, new GridPos(collectPos));
    const collectId = em.create(
      ...baseItemComponents,
      new GridPos(collectPos),
      new Fixed({})
    ).id;
    collectFlow.start$.next({ collectorId });
    expect(em.getComponent(collectorId, Inventory).contents).not.toContain(
      collectId
    );
    expect(results).toEqual({
      collected: false,
      noCollection: true,
      finished: true,
      error: false,
    });
  });

  it('should behave well when completed without any input message', () => {
    let errorOccurred = false;
    let completed = false;
    collectFlow.finish$.subscribe({
      error: () => (errorOccurred = true),
      complete: () => (completed = true),
    });
    collectFlow.start$.complete();
    expect(errorOccurred).toEqual(false);
    expect(completed).toEqual(true);
  });
});
