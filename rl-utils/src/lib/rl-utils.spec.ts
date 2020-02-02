import { withinRange } from './rl-utils';

describe('Within range', () => {
  it('should return true for a value in range', () => {
    expect(withinRange(1, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 })).toEqual(
      true
    );
  });
  it('return false for a value just out of range', () => {
    expect(withinRange(1, { x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 0 })).toEqual(
      false
    );
  });

  it('should return correctly for negative values', () => {
    expect(
      withinRange(1, { x: -5, y: -5, z: -5 }, { x: -6, y: -5, z: -5 })
    ).toEqual(true);
  });
});
