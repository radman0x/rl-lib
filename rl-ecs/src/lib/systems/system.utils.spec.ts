import { renameKey, withinRange } from './systems.utils';

describe('Rename key', () => {
  it(`should silently noop if the original name and target name are the same`, () => {
    const data = { one: 'one' };
    renameKey(data, 'one', 'one');
    expect(data).toEqual({ one: 'one' });
  });
  it(`should raise an error when trying to rename a key that doesnt exist`, () => {
    const data = {};
    expect(() => renameKey(data, 'one' as never, 'three')).toThrow();
  });
  it(`should rename a key in an object`, () => {
    const data = { one: 'one', two: 'two' };
    renameKey(data, 'one', 'three');
    expect(data).toEqual({ three: 'one', two: 'two' });
  });
});

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
