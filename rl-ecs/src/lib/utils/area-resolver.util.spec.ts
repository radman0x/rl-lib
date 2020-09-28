import { EntityManager } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { AreaResolver } from './area-resolver.util';

describe('Area Resolver', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  const areaName = 'testArea';
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    areaResolver = new AreaResolver();
  });

  it('should construct with an area correctly', () => {
    areaResolver = new AreaResolver({ [areaName]: (em: EntityManager) => {} });
    expect(areaResolver.hasArea(areaName)).toBe(true);
  });

  it('should allow adding of an area after construction', () => {
    areaResolver.setBuilder(areaName, (em: EntityManager) => {});
    expect(areaResolver.hasArea(areaName)).toBe(true);
  });

  it('should load contents of new area on load', () => {
    areaResolver = new AreaResolver({
      [areaName]: (loadTo: EntityManager) =>
        loadTo.create(new GridPos({ x: 1, y: 1, z: 1 }))
    });
    areaResolver.load(areaName, em);
    expect(em.matchingIndex(new GridPos({ x: 1, y: 1, z: 1 })).length).toBe(1);
  });

  it('should throw an error if there is an attempt to load an area that does not have a loader registered', () => {
    areaResolver = new AreaResolver();
    expect(() => areaResolver.load('not exist!', em)).toThrow();
  });

  it('should not load an area if it has been previously loaded', () => {
    areaResolver = new AreaResolver({
      [areaName]: (loadTo: EntityManager) =>
        loadTo.create(new GridPos({ x: 1, y: 1, z: 1 }))
    });
    areaResolver.load(areaName, em);
    areaResolver.load(areaName, em);
    expect(em.matchingIndex(new GridPos({ x: 1, y: 1, z: 1 })).length).toBe(1);
  });
});
