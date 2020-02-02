import { renameKey } from './systems.utils';

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
