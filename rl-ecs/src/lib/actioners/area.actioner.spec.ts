import { EntityManager, EntityId } from 'rad-ecs';
import { AreaResolver } from '../utils/area-resolver.util';
import { GridPos, GridPosData } from '../components/position.model';
import { area } from './area.actioner';
import { AreaIngress } from '../components/area-ingress';

describe('Area change actioner', () => {
  let em: EntityManager;
  let areaResolver: AreaResolver;
  const areaName = 'testArea';
  let effectTargetId: EntityId;
  let msg: any;
  let areaId: string;
  let ingressLabel: string;
  let ingressTarget: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    areaResolver = new AreaResolver();
    effectTargetId = em.create().id;
    areaId = 'somehting';
    ingressLabel = 'blah';
    msg = {
      effectTargetId,
      areaTransition: { ingressLabel, areaId }
    };
    ingressTarget = { x: 2, y: 2, z: 2 };
  });
  it('should do nothing if the area change data is not present', () => {
    const out = area({}, em, areaResolver);
    expect(out.worldStateChangeDescription).toBe(null);
  });

  it('should throw an error if the area to load cannot be found', () => {
    expect(() => area(msg, em, areaResolver)).toThrow();
  });

  it('should throw an error if the new area does not contain a matching ingress label', () => {
    areaResolver.setBuilder(areaId, (em: EntityManager) => {});
    expect(() => area(msg, em, areaResolver)).toThrow();
  });

  it('should place the player at the ingress label with correct area change data', () => {
    areaResolver.setBuilder(areaId, (em: EntityManager) => {
      em.create(
        new AreaIngress({ label: ingressLabel }),
        new GridPos(ingressTarget)
      );
    });
    const out = area(msg, em, areaResolver);
    expect(out.worldStateChangeDescription).not.toBe(null);
    expect(em.getComponent(effectTargetId, GridPos)).toEqual(ingressTarget);
    expect(em.matching(AreaIngress).length).toBe(1);
  });
});
