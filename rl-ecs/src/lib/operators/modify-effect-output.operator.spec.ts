import { EntityManager, EntityId } from 'rad-ecs';
import { Subject } from 'rxjs';
import { GridPos } from '../components/position.model';
import { modifyEffectOutput } from './modify-effect-output.operator';
import { MagicResistance } from '../components/magic-resistance.model';
import { Teleported } from '../systems.types';

import * as _ from 'lodash';

describe('Modify effect output', () => {
  let em: EntityManager;
  let start$: Subject<any>;
  let error: boolean | string;
  let out: any;
  let effectTargetId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    error = false;
    out = null;
  });
  it('should remove a teleport effect action if magic resistance is present', () => {
    const pos = { x: 1, y: 1, z: 1 };
    const teleport: Teleported = {
      teleport: { targetLocation: pos },
    };
    effectTargetId = em.create(new MagicResistance({})).id;
    const flow = modifyEffectOutput(_.merge({ effectTargetId }, teleport), em);
    flow.subscribe({
      next: (msg) => (out = msg),
      error: (err) => (error = err),
    });
    expect(error).toEqual(false);
    expect(out).toEqual({ effectTargetId, teleport: null });
  });
});
