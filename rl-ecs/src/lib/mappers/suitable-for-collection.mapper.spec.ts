import { EntityManager } from 'rad-ecs';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { suitableForCollection } from './suitable-for-collection.mapper';
import { Fixed } from '../components/fixed.model';

describe('Suitable for collection', () => {
  let em: EntityManager;

  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
  });

  it('should find an entity without a physical component unsuitable', () => {
    const collectibleId = em.create().id;
    expect(
      suitableForCollection({ collectibleId }, em).suitableCollectId
    ).toEqual(null);
  });

  it('should find an entity with just a physical component suitable', () => {
    const collectibleId = em.create(new Physical({ size: Size.SMALL })).id;
    expect(
      suitableForCollection({ collectibleId }, em).suitableCollectId
    ).toEqual(collectibleId);
  });

  it('should find an otherwise suitable entity with a fixed component unsuitable', () => {
    const collectibleId = em.create(
      new Physical({ size: Size.SMALL }),
      new Fixed({})
    ).id;
    expect(
      suitableForCollection({ collectibleId }, em).suitableCollectId
    ).toEqual(null);
  });
});
