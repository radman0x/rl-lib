import { Subject } from 'rxjs';
import { noneOf } from './none-of.operator';

describe('Filter reduce operator', () => {
  let subject: Subject<{ val: number }>;
  beforeEach(() => {
    subject = new Subject();
  });
  it('should not trigger with one input event that the predicate matches', () => {
    let triggered = false;
    subject
      .pipe(noneOf(msg => msg.val === 5))
      .subscribe(() => (triggered = true));
    subject.next({ val: 5 });
    subject.complete();
    expect(triggered).toEqual(false);
  });

  it('should trigger with one input event that the predicate does NOT match', () => {
    let triggered = false;
    subject
      .pipe(noneOf(msg => msg.val === 5))
      .subscribe(() => (triggered = true));
    subject.next({ val: 9 });
    subject.complete();
    expect(triggered).toEqual(true);
  });

  it('should not trigger with N input events when one of them matches', () => {
    let triggered = false;
    subject
      .pipe(noneOf(msg => msg.val === 5))
      .subscribe(() => (triggered = true));
    subject.next({ val: 9 });
    subject.next({ val: 3 });
    subject.next({ val: 5 });
    subject.complete();
    expect(triggered).toEqual(false);
  });

  it('should trigger with N input events when NONE of them match', () => {
    let triggered = false;
    subject
      .pipe(noneOf(msg => msg.val === 5))
      .subscribe(() => (triggered = true));
    subject.next({ val: 9 });
    subject.next({ val: 3 });
    subject.next({ val: 11 });
    subject.complete();
    expect(triggered).toEqual(true);
  });
});
