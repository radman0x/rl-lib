import { EntityId, EntityManager } from 'rad-ecs';
import { AreaOfEffect } from '../components/area-of-effect.model';
import { acquireAoePositions } from './acquire-aoe-targets.system';

describe('Acquire positions in radius', () => {
  let em: EntityManager;
  const basicPos = { x: 1, y: 1, z: 1 };
  let effectId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    effectId = em.create(new AreaOfEffect({ radius: 0 })).id;
  });

  it('should return no positions for a radius of 0', () => {
    let result = acquireAoePositions(
      {
        effectId,
        selectedPos: basicPos,
      },
      em
    );
    expect(result.acquiredPositions).not.toEqual(null);
    expect(result.acquiredPositions.length).toEqual(0);
  });

  it('should return 27 positions for a radius of 1', () => {
    em.setComponent(effectId, new AreaOfEffect({ radius: 1 }));
    let result = acquireAoePositions(
      {
        effectId,
        selectedPos: basicPos,
      },
      em
    );
    expect(result.acquiredPositions).not.toEqual(null);
    expect(result.acquiredPositions.length).toEqual(27);
  });
});
