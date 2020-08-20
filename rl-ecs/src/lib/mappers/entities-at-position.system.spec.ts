import { EntityManager, EntityId } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { entitiesAtPosition } from './entities-at-position.system';

describe('Entities at position', () => {
  let em: EntityManager;
  let targetPos: { x: number; y: number; z: number };
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    targetPos = { x: 1, y: 5, z: 2 };
  });

  it('should retrieve nothing if there are no entities at a position', () => {
    const matching = entitiesAtPosition({ targetPos }, em, 'outId');
    expect(matching.length).toEqual(1);
    expect(matching[0].outId).toEqual(null);
  });

  describe('Single entity retrieval', () => {
    let solitaryId: EntityId;
    beforeEach(() => {
      solitaryId = em.create(new GridPos(targetPos)).id;
    });
    it('should retrieve all entities at a position', () => {
      const matching = entitiesAtPosition({ targetPos }, em, 'outId');
      expect(matching.length).toEqual(1);
      expect(matching[0].outId).toEqual(solitaryId);
    });

    it('should retrieve only the entities at position, not any others', () => {
      const otherPos = { x: 5, y: 7, z: 8 };
      em.create(new GridPos(otherPos));
      const matching = entitiesAtPosition({ targetPos }, em, 'outId');
      expect(matching[0].outId).toEqual(solitaryId);
    });

    it('should include an entity based on the provided predicate', () => {
      const matching = entitiesAtPosition(
        { targetPos },
        em,
        'outId',
        e => e.id === solitaryId
      );
      expect(matching.length).toEqual(1);
      expect(matching[0].outId).toEqual(solitaryId);
    });

    it('should exclude an entity based on the provided predicate', () => {
      const matching = entitiesAtPosition(
        { targetPos },
        em,
        'outId',
        e => e.id !== solitaryId
      );
      expect(matching.length).toEqual(1);
      expect(matching[0].outId).toEqual(null);
    });
  });
});
