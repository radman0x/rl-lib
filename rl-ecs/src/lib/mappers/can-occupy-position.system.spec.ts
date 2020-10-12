import { EntityManager } from 'rad-ecs';
import { canOccupyPosition } from './can-occupy-position.system';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';

describe('Can occupy position', () => {
  let em: EntityManager;
  let fillPos = { x: 1, y: 1, z: 1 };
  let smallPos = { x: 2, y: 2, z: 1 };
  let emptyPos = { x: 3, y: 3, z: 1 };
  let noPhysicalPos = { x: 4, y: 4, z: 1 };

  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    em.create(new Physical({ size: Size.FILL }), new GridPos(fillPos));
    em.create(new Physical({ size: Size.SMALL }), new GridPos(smallPos));
    em.create(new GridPos(noPhysicalPos));
  });

  it('should report not occupable when a FILL size element exists at the target position', () => {
    const result = canOccupyPosition({ targetPos: new GridPos(fillPos) }, em);
    expect(result.canOccupy).toEqual(false);
  });

  it('should report true when nothing is at the target position', () => {
    const result = canOccupyPosition({ targetPos: new GridPos(emptyPos) }, em);
    expect(result.canOccupy).toEqual(true);
  });

  it('should report true when an entity with acceptable size exists at the target position', () => {
    const result = canOccupyPosition({ targetPos: new GridPos(smallPos) }, em);
    expect(result.canOccupy).toEqual(true);
  });

  it('should report true when an entity without a physical component exists at the target position', () => {
    const result = canOccupyPosition(
      { targetPos: new GridPos(noPhysicalPos) },
      em
    );
    expect(result.canOccupy).toEqual(true);
  });
});
