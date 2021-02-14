import { EntityId, EntityManager } from 'rad-ecs';
import {
  AreaTransition,
  AreaTransitionData,
} from '../components/area-transition.model';
import { GridPos } from '../components/position.model';
import { transitionArea } from './transition-area.system';

describe('Transition Area', () => {
  let em: EntityManager;
  let msg: any;
  let effectId: EntityId;
  let transitionData: AreaTransitionData;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    transitionData = { areaId: 'test', ingressLabel: 'something' };
    effectId = em.create(new AreaTransition(transitionData)).id;
    msg = { effectId };
  });

  it('should do nothing if the appropriate component is not present', () => {
    em.removeComponent(effectId, AreaTransition);
    const out = transitionArea(msg, em);
    expect(out).toStrictEqual({
      ...msg,
      areaTransition: null,
      effectReport: null,
    });
  });

  it('should add appropriate data if the appropriate component is present', () => {
    const out = transitionArea(msg, em);
    expect(out).toMatchObject({ effectId, areaTransition: transitionData });
    expect(out.activeEffectDescription).not.toBe(null);
  });
});
