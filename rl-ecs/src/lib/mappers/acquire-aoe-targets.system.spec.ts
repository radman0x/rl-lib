import { acquireAoePositions } from './acquire-aoe-targets.system';

describe('Acquire positions in radius', () => {
  const basicPos = { x: 1, y: 1, z: 1 };

  it(`should throw if input values aren't provided`, () => {
    expect(() => acquireAoePositions({} as any)).toThrow();
    expect(() =>
      acquireAoePositions({
        targetPos: basicPos
      } as any)
    ).toThrow();
  });

  it('should return no positions for a radius of 0', () => {
    let result = acquireAoePositions({
      areaOfEffect: { radius: 0 },
      selectedPos: basicPos
    });
    expect(result.length).toEqual(0);
  });

  it('should return 27 positions for a radius of 1', () => {
    let result = acquireAoePositions({
      areaOfEffect: { radius: 1 },
      selectedPos: basicPos
    });
    expect(result.length).toEqual(27);
  });
});
