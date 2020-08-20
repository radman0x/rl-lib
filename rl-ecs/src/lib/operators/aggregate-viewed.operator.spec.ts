import { Subject } from 'rxjs';
import { Viewed, aggregateViewed } from './aggregate-viewed.operator';
import { GridPos } from '@rad/rl-ecs';

describe('Aggregate viewed', () => {
  let source: Subject<Viewed>;
  let thePos: { x: number; y: number; z: number };
  let thePosId: string;
  let sightedId: number;
  beforeEach(() => {
    source = new Subject();
    thePos = { x: 1, y: 1, z: 1 };
    thePosId = `1,1,1`;
    sightedId = 1;
  });

  it('should produce null if no input messages were received', () => {
    let value = undefined;
    source.pipe(aggregateViewed).subscribe(output => {
      value = output;
    });
    source.complete();
    expect(value).toEqual(null);
  });
  it('should aggregate from one message ', () => {
    let value = null;
    source.pipe(aggregateViewed).subscribe(output => {
      value = output[sightedId][thePosId];
    });
    source.next({
      sightedId,
      viewed: { atPos: new GridPos(thePos), entityId: 5 }
    });
    source.complete();
    expect(value).toEqual({ entityIds: [5], pos: new GridPos(thePos) });
  });

  it('should aggregate from N messages for one sighted one pos', () => {
    let value = null;
    source.pipe(aggregateViewed).subscribe(output => {
      value = output[sightedId][thePosId];
    });

    source.next({
      sightedId,
      viewed: { atPos: new GridPos(thePos), entityId: 5 }
    });
    source.next({
      sightedId,
      viewed: { atPos: new GridPos(thePos), entityId: 6 }
    });
    source.next({
      sightedId,
      viewed: { atPos: new GridPos(thePos), entityId: 7 }
    });
    source.complete();
    expect(value).toEqual({ entityIds: [5, 6, 7], pos: new GridPos(thePos) });
  });

  it('should aggregate from N messages one sighted three pos', () => {
    let value = null;
    source.pipe(aggregateViewed).subscribe(output => {
      value = output[sightedId];
    });
    source.next({
      sightedId,
      viewed: { atPos: new GridPos(thePos), entityId: 5 }
    });
    source.next({
      sightedId,
      viewed: { atPos: new GridPos({ ...thePos, x: 2 }), entityId: 6 }
    });
    source.next({
      sightedId,
      viewed: { atPos: new GridPos({ ...thePos, x: 3 }), entityId: 7 }
    });
    source.complete();
    expect(value).toEqual({
      [`1,1,1`]: { entityIds: [5], pos: new GridPos(thePos) },
      [`2,1,1`]: { entityIds: [6], pos: new GridPos({ ...thePos, x: 2 }) },
      [`3,1,1`]: { entityIds: [7], pos: new GridPos({ ...thePos, x: 3 }) }
    });
  });
});
