import { resolveMove } from './resolve-move.system';
describe('Resolve move', () => {
  let msg;
  beforeEach(() => {
    msg = {
      movingId: 1,
      targetPos: { x: 0, y: 0, z: 0 },
      canStand: true,
      canOccupy: true,
      isBlocked: false
    };
  });

  it('should set output to null move data when the moving entity id in input message is null', () => {
    const out = resolveMove({ ...msg, movingId: null });
    expect(out).toMatchObject({ newPosition: null });
  });

  it('should set output to null move data when target position in input message is null', () => {
    const out = resolveMove({ ...msg, targetPos: null });
    expect(out).toMatchObject({ newPosition: null });
  });

  it('should set output to null if standing is not possible', () => {
    const out = resolveMove({ ...msg, canStand: false });
    expect(out).toMatchObject({ newPosition: null });
  });

  it('should set output to null if occpying the position is not possible', () => {
    const out = resolveMove({ ...msg, canOccupy: false });
    expect(out).toMatchObject({ newPosition: null });
  });

  it('should set output to null if the position is blocked', () => {
    const out = resolveMove({ ...msg, isBlocked: true });
    expect(out).toMatchObject({ newPosition: null });
  });

  it('should create move data when the move is ok', () => {
    const out = resolveMove(msg);
    expect(out).toMatchObject({
      movingId: 1,
      newPosition: { x: 0, y: 0, z: 0 }
    });
  });
});
