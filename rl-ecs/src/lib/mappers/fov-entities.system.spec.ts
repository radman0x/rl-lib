import { EntityManager, EntityId } from 'rad-ecs';
import { Sighted } from '../components/sighted.model';
import { GridPos } from '@rad/rl-ecs';
import { fovEntities, FOVEntitiesArgs } from './fov-entities.system';

describe('FOV entity collection', () => {
  let em: EntityManager;
  let sightedId: EntityId;
  const viewerPos = { x: 1, y: 1, z: 1 };
  let msg: FOVEntitiesArgs;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);

    sightedId = em.create(new Sighted({ range: 5 }), new GridPos(viewerPos)).id;
    msg = {
      sightedId,
      viewerPos: new GridPos(viewerPos),
      sighted: em.getComponent(sightedId, Sighted)
    };
  });

  it('Should see self even if no other entities exist', () => {
    const seen = fovEntities(msg, em);
    expect(seen.length).toEqual(1);
    expect(seen[0].viewed.entityId).toEqual(sightedId);
  });

  it('Should see other entities if they exist', () => {
    const seenId = em.create(new GridPos({ ...viewerPos, x: 0 })).id;
    const seen = fovEntities(msg, em);
    expect(seen.length).toEqual(2);
    JSON.stringify(seen, null, 2);
    expect(seen).toContainEqual({
      ...msg,
      viewed: { entityId: sightedId, atPos: new GridPos(viewerPos) }
    });
    expect(seen).toContainEqual({
      ...msg,
      viewed: { entityId: seenId, atPos: new GridPos({ ...viewerPos, x: 0 }) }
    });
  });
});
