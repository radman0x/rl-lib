import * as _ from 'lodash';
import { EntityId, EntityManager } from 'rad-ecs';
import { MagicResistance } from '../../components/magic-resistance.model';
import { Teleported } from '../../systems.types';
import { magicResistance } from './magic-resistance.mapper';
import { GridPosData } from '../../components/position.model';

describe('Magic resistance', () => {
  let em: EntityManager;
  let effectTargetId: EntityId;
  let pos: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    effectTargetId = em.create(new MagicResistance({})).id;
    pos = { x: 0, y: 0, z: 0 };
  });

  it('should be a noop if there is no effect target', () => {
    const teleport: Teleported = {
      teleport: { targetLocation: pos }
    };
    effectTargetId = null;
    const out = magicResistance(_.merge({ effectTargetId }, teleport), em);
    expect(out).toEqual({ effectTargetId, teleport: { targetLocation: pos } });
  });

  it('should remove a teleport effect', () => {
    const teleport: Teleported = {
      teleport: { targetLocation: pos }
    };
    const out = magicResistance(_.merge({ effectTargetId }, teleport), em);
    expect(out).toEqual({ effectTargetId, teleport: null });
  });
});
