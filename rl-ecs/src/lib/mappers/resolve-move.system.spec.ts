import { resolveMove } from './resolve-move.system';
describe('Resolve move', () => {
  let msg;
  beforeEach(() => {
    msg = {
      movingId: 1,
      targetPos: { x: 0, y: 0, z: 0 },
      canStand: true,
      canOccupy: true
    };
  });

  it('should set output to null move data when the moving entity id in input message is null', () => {
    const out = resolveMove({ ...msg, movingId: null });
    expect(out).toMatchObject({ spatial: null });
  });

  it('should set output to null move data when target position in input message is null', () => {
    const out = resolveMove({ ...msg, targetPos: null });
    expect(out).toMatchObject({ spatial: null });
  });

  it('should set output to null if standing is not possible', () => {
    const out = resolveMove({ ...msg, canStand: false });
    expect(out).toMatchObject({ spatial: null });
  });

  it('should set output to null of occpying the position is not possible', () => {
    const out = resolveMove({ ...msg, canOccupy: false });
    expect(out).toMatchObject({ spatial: null });
  });

  it('should create move data when the move is ok', () => {
    const out = resolveMove(msg);
    expect(out).toMatchObject({
      spatial: { movingId: 1, newPos: { x: 0, y: 0, z: 0 } }
    });
  });
});
