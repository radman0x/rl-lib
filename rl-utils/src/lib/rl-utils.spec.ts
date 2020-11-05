import { unitDirectionVec3, withinRange } from './rl-utils';

const NORTH = { x: 0, y: 1, z: 0 };
const ORIGIN = { x: 0, y: 0, z: 0 };
const NE = { x: 1, y: 1, z: 0 };
const SE = { x: -1, y: -1, z: 0 };

describe('RL Utils', () => {
  describe('Within range', () => {
    it('should return true for a value in range', () => {
      expect(
        withinRange(1, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 })
      ).toEqual(true);
    });
    it('return false for a value just out of range', () => {
      expect(
        withinRange(1, { x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 0 })
      ).toEqual(false);
    });

    it('should return correctly for negative values', () => {
      expect(
        withinRange(1, { x: -5, y: -5, z: -5 }, { x: -6, y: -5, z: -5 })
      ).toEqual(true);
    });
  });

  describe('Vec3 utils', () => {
    describe('Unit direction', () => {
      it('should provide correct output for cardinal directions', () => {
        expect(unitDirectionVec3(ORIGIN, NORTH)).toEqual(NORTH);
        expect(
          unitDirectionVec3({ x: 10, y: 9, z: 0 }, { x: 10, y: 10, z: 0 })
        ).toEqual(NORTH);
      });

      it('should provide correct output for diagonal directions', () => {
        let dir = unitDirectionVec3(ORIGIN, NE);
        expect(dir.x).toBeCloseTo(0.707);
        expect(dir.y).toBeCloseTo(0.707);

        dir = unitDirectionVec3(ORIGIN, SE);
        expect(dir.x).toBeCloseTo(-0.707);
        expect(dir.y).toBeCloseTo(-0.707);
      });
    });
  });
});
