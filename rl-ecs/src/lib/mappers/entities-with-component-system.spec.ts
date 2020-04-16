import { EntityManager, EntityId } from 'rad-ecs';
import { GridPos, Renderable } from '@rad/rl-ecs';
import { entitiesWithComponents } from './entities-with-component.system';

describe('Entities with components mapper', () => {
  let em: EntityManager;
  beforeEach(() => {
    em = new EntityManager();
  });
  it('should find a single entity from a single input type', () => {
    const firstId = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
    const out = entitiesWithComponents(
      { componentTypes: [GridPos] },
      em,
      'outId'
    );
    expect(out.length).toEqual(1);
    expect(out[0].outId).toEqual(firstId);
  });

  it('should find multiple entities for a single input type', () => {
    const firstId = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
    const secondId = em.create(new GridPos({ x: 1, y: 1, z: 2 })).id;
    const out = entitiesWithComponents(
      { componentTypes: [GridPos] },
      em,
      'outId'
    );
    expect(out.length).toEqual(2);
    expect(out.map(msg => msg.outId)).toContain(firstId);
    expect(out.map(msg => msg.outId)).toContain(secondId);
  });

  it('should find a single entity with two components', () => {
    const id = em.create(
      new GridPos({ x: 1, y: 1, z: 1 }),
      new Renderable({ image: 'blah', zOrder: 1 })
    ).id;
    const out = entitiesWithComponents(
      { componentTypes: [Renderable, GridPos] },
      em,
      'outId'
    );
    expect(out.length).toEqual(1);
    expect(out.map(msg => msg.outId)).toContain(id);
  });

  it('should return a single entry with output key holding null if no matches are found', () => {
    const out = entitiesWithComponents(
      { componentTypes: [GridPos] },
      em,
      'outId'
    );
    expect(out.length).toEqual(1);
    expect(out[0].outId).toEqual(null);
  });
});
