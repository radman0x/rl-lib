import { EntityId, EntityManager } from 'rad-ecs';
import { Physical, Size } from '../components/physical.model';
import { GridPos, GridPosData } from '../components/position.model';
import { canStandAtPosition } from './can-stand-at-position.system';
describe('Can stand at', () => {
  let em: EntityManager;
  let startPos: GridPosData;
  let targetPos: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    startPos = { x: 0, y: 0, z: 0 };
    targetPos = { x: 0, y: 1, z: 0 };
    em.create(
      new GridPos({ ...targetPos, z: -1 }),
      new Physical({ size: Size.FILL })
    );
  });

  it('should noop if target is null', () => {
    const msg = { targetPos: null };
    const out = canStandAtPosition(msg, em);
    expect(out).toEqual({
      canStand: null,
      targetPos: null
    });
  });

  it('should produce correct data when there are no entities at the position', () => {
    const otherPos = { x: 7, y: 7, z: 7 };
    const msg = { targetPos: new GridPos(otherPos) };
    const out = canStandAtPosition(msg, em);
    expect(out).toEqual({
      canStand: false,
      targetPos: { x: 7, y: 7, z: 7 }
    });
  });

  it('should produce correct data when the position can be stood at', () => {
    const msg = { targetPos };
    const out = canStandAtPosition(msg, em);
    expect(out).toEqual({
      canStand: true,
      targetPos: { x: 0, y: 1, z: 0 }
    });
  });
});
