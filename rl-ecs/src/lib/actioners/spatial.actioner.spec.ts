import * as _ from 'lodash';
import { EntityId, EntityManager } from 'rad-ecs';
import { Teleported } from '../systems.types';
import { spatial } from './spatial.actioner';
import { GridPos } from '../components/position.model';

describe('Spatial actioner', () => {
  let em: EntityManager;
  let effectTargetId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    effectTargetId = em.create().id;
  });

  it('should make correct updates when a teleport effect is present', () => {
    const pos = { x: 1, y: 1, z: 1 };
    const teleport: Teleported = {
      teleport: { targetLocation: pos }
    };
    spatial(_.merge({ effectTargetId }, teleport), em);
    expect(em.hasComponent(effectTargetId, GridPos)).toEqual(true);
    expect(em.getComponent(effectTargetId, GridPos)).toEqual(pos);
  });
});
