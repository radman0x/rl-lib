import { EntityManager, EntityId } from 'rad-ecs';
import { GridPos, GridPosData } from '../components/position.model';
import { Physical, Size } from '../components/physical.model';
import { Blockage } from '../components/blockage.model';
import { ValueMap } from '@rad/rl-utils';
import {
  dijkstra,
  NodeEntry,
  ClosedSet,
  neighbours,
  updateDistanceMap
} from './update-distance-map.actioner';
import { DistanceMap } from '@rad/rl-ecs';

describe('Generate distance map', () => {
  let em: EntityManager;
  let locusId: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    for (let x = 0; x < 3; ++x) {
      for (let y = 0; y < 3; ++y) {
        em.create(
          new GridPos({ x, y, z: -1 }),
          new Physical({ size: Size.FILL })
        );
      }
    }
    locusId = em.create(new GridPos({ x: 1, y: 1, z: 0 })).id;
  });

  it('should return correct data when only the locus exists', () => {
    em = new EntityManager();
    em.indexBy(GridPos);
    locusId = em.create(new GridPos({ x: 1, y: 1, z: 1 })).id;
    updateDistanceMap({ locusId }, em);

    expect(em.getComponent(locusId, DistanceMap).map.count()).toEqual(1);
  });

  it('should return a correct map for a 9 square grid with locus at the center ', () => {
    updateDistanceMap({ locusId }, em);
    const map = em.getComponent(locusId, DistanceMap).map;
    expect(map.count()).toEqual(9);
    for (let x = 0; x < 3; ++x) {
      for (let y = 0; y < 3; ++y) {
        if (x === 1 && y === 1) {
          expect(map.get(new GridPos({ x, y, z: 0 }))).toEqual(0);
        } else {
          expect(map.get(new GridPos({ x, y, z: 0 }))).toEqual(1);
        }
      }
    }
  });

  it('should return a correct map for a 9 square grid when the side positions are filled', () => {
    for (let x = 0; x < 3; ++x) {
      for (let y = 0; y < 3; ++y) {
        if (x === 0 || y === 0) {
          x;
          y;
          em.create(
            new GridPos({ x, y, z: 0 }),
            new Physical({ size: Size.FILL })
          );
        }
      }
    }
    updateDistanceMap({ locusId }, em);
    expect(em.getComponent(locusId, DistanceMap).map.count()).toEqual(4);
  });

  it('should return a correct map for a 9 square grid when the side positions are blocked', () => {
    for (let x = 0; x < 3; ++x) {
      for (let y = 0; y < 3; ++y) {
        if (x === 0 || y === 0) {
          x;
          y;
          em.create(
            new GridPos({ x, y, z: 0 }),
            new Blockage({ active: true, triggers: [] })
          );
        }
      }
    }
    updateDistanceMap({ locusId }, em);
    expect(em.getComponent(locusId, DistanceMap).map.count()).toEqual(4);
  });

  describe('Utils', () => {
    describe('Dijkstra', () => {
      let walkable: (GridPosData) => boolean;
      let walkableMap: ValueMap<GridPos, boolean>;
      beforeEach(() => {
        walkableMap = new ValueMap();
        for (let x = 0; x < 3; ++x) {
          for (let y = 0; y < 3; ++y) {
            walkableMap.set(new GridPos({ x, y, z: 0 }), true);
          }
        }
        walkable = (pos: GridPosData) => walkableMap.has(new GridPos(pos));
      });

      it('should return correct data when only the locus exists', () => {
        walkable = () => false;
        const out = dijkstra({ x: 1, y: 1, z: 0 }, walkable);
        expect(out.count()).toEqual(1);
      });

      it('should return a correct map for a 9 square grid with locus at the center', () => {
        const out = dijkstra({ x: 1, y: 1, z: 0 }, walkable);
        expect(out.count()).toEqual(9);
        for (let x = 0; x < 3; ++x) {
          for (let y = 0; y < 3; ++y) {
            if (x === 1 && y === 1) {
              expect(out.get(new GridPos({ x, y, z: 0 }))).toEqual(0);
            } else {
              expect(out.get(new GridPos({ x, y, z: 0 }))).toEqual(1);
            }
          }
        }
      });

      it('should return a correct map for a 9 square grid with locus at 0,0,0', () => {
        const out = dijkstra({ x: 0, y: 0, z: 0 }, walkable);
        expect(out.count()).toEqual(9);
        for (let x = 0; x < 3; ++x) {
          for (let y = 0; y < 3; ++y) {
            if (x === 0 && y === 0) {
              expect(out.get(new GridPos({ x, y, z: 0 }))).toEqual(0);
            } else {
              console.log(
                `x: ${x}, y: ${y}, ${out.get(new GridPos({ x, y, z: 0 }))}`
              );
              expect(out.get(new GridPos({ x, y, z: 0 }))).toEqual(
                Math.max(x, y)
              );
            }
          }
        }
      });
    });
    describe('Add neighbours', () => {
      let curr: NodeEntry;
      let closedSet: ClosedSet;
      let walkable: (GridPosData) => boolean;
      let walkableMap: ValueMap<GridPos, boolean>;
      beforeEach(() => {
        curr = { pos: { x: 1, y: 1, z: 0 }, distance: 0 };
        closedSet = new ValueMap();
        walkableMap = new ValueMap();
        for (let x = 0; x < 3; ++x) {
          for (let y = 0; y < 3; ++y) {
            walkableMap.set(new GridPos({ x, y, z: 0 }), true);
          }
        }
        walkable = (pos: GridPosData) => walkableMap.has(new GridPos(pos));
      });

      it('should retrieve no neighbours when no positions are walkable', () => {
        walkable = (pos: GridPosData) => false;
        expect(neighbours(curr, closedSet, walkable).length).toEqual(0);
      });
      it('should retrieve all 8 around when all walkable', () => {
        expect(neighbours(curr, closedSet, walkable).length).toEqual(8);
      });

      it('should not receive positions that would be out of bounds', () => {
        curr = { pos: { x: 2, y: 2, z: 0 }, distance: 0 };
        expect(neighbours(curr, closedSet, walkable).length).toEqual(3);

        curr = { pos: { x: 0, y: 0, z: 0 }, distance: 0 };
        expect(
          neighbours(curr, closedSet, walkable).map(value => ({
            x: value.pos.x,
            y: value.pos.y
          }))
        ).toContainEqual({ x: 1, y: 1 });
      });
    });
  });
});
