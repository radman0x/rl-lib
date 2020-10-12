import { EntityManager } from 'rad-ecs';
import { GridPos, GridPosData } from '../components/position.model';
import { Physical, Size } from '../components/physical.model';
import { Subject } from 'rxjs';
import { gatherBumpInfo } from './gather-bump-info.operator';
import { Martial } from '../components/martial.model';
describe('Gather bump info', () => {
  let em: EntityManager;
  let targetPos: GridPosData;
  let otherPos: GridPosData;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    targetPos = { x: 0, y: 1, z: 0 };
    otherPos = { x: 7, y: 7, z: 7 };
    em.create(
      new GridPos({ ...targetPos, z: targetPos.z - 1 }),
      new Physical({ size: Size.FILL })
    );
  });

  it('should produce correct data when there are no entities at the target', () => {
    const out = gatherBumpInfo({ targetPos: otherPos }, em);
    expect(out).toMatchObject({
      targetPos: otherPos,
      canOccupy: true,
      canStand: false,
      combatTargetId: null,
    });
  });
  it('should produce correct data when the target can be stood on', () => {
    const out = gatherBumpInfo({ targetPos }, em);
    expect(out).toMatchObject({
      targetPos,
      canOccupy: true,
      canStand: true,
      combatTargetId: null,
    });
  });
  it('should produce correct data when the target can be stood on but cannot be occupied', () => {
    em.create(new GridPos(targetPos), new Physical({ size: Size.FILL }));
    const out = gatherBumpInfo({ targetPos }, em);
    expect(out).toMatchObject({
      targetPos,
      canOccupy: false,
      canStand: true,
      combatTargetId: null,
    });
  });
  it('should produce correct data when the target can be stood on and there is a combat target', () => {
    const combatTargetId = em.create(
      new Martial({ strength: 1, toughness: 1, weaponSkill: 1 }),
      new GridPos(targetPos)
    ).id;
    em.create(new GridPos(targetPos), new Physical({ size: Size.FILL }));
    const out = gatherBumpInfo({ targetPos }, em);
    expect(out).toMatchObject({
      targetPos,
      canOccupy: false,
      canStand: true,
      combatTargetId,
    });
  });
});
