import { CompassDirection, DIR_FROM_KEY_VI } from '@rad/rl-utils';
import { Subject } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';

import * as rxjsSpy from 'rxjs-spy';

export class InputHandler {
  public keyInput$ = new Subject<string>();

  public move$ = new Subject<CompassDirection>();
  public climb$ = new Subject<void>();
  public rest$ = new Subject<void>();
  public interact$ = new Subject<void>();
  public craft$ = new Subject<void>();
  public useAbility$ = new Subject<void>();
  public collect$ = new Subject<void>();
  public escape$ = new Subject<void>();
  public snapToPlayer$ = new Subject<void>();
  public zoomIn$ = new Subject<void>();
  public zoomOut$ = new Subject<void>();

  constructor() {
    this.keyInput$
      .pipe(
        filter((key) => key === '.' || key === '5'),
        rxjsSpy.operators.tag('inputHandler.rest'),
        mapTo(void 0)
        // tap((key) => console.log(`Resting: ${key}`))
      )
      .subscribe(this.rest$);

    this.keyInput$
      .pipe(
        filter((key) => DIR_FROM_KEY_VI.has(key)),
        rxjsSpy.operators.tag('inputHandler.move'),
        map((key) => DIR_FROM_KEY_VI.get(key)!)
      )
      .subscribe(this.move$);

    this.keyInput$
      .pipe(
        filter((key) => key === '<' || key === '>'),
        rxjsSpy.operators.tag('inputHandler.climb'),
        tap((key) => console.log(`Climb key: ${key}`)),
        mapTo(void 0)
      )
      .subscribe(this.climb$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'a'),
        rxjsSpy.operators.tag('inputHandler.interact'),
        mapTo(void 0)
      )
      .subscribe(this.interact$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'C'),
        rxjsSpy.operators.tag('inputHandler.craft'),
        mapTo(void 0)
      )
      .subscribe(this.craft$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'A'),
        rxjsSpy.operators.tag('inputHandler.ability'),
        mapTo(void 0)
      )
      .subscribe(this.useAbility$);

    this.keyInput$
      .pipe(
        filter((key) => key === ',' || key === ' '),
        rxjsSpy.operators.tag('inputHandler.collect'),
        mapTo(void 0)
      )
      .subscribe(this.collect$);
    this.keyInput$
      .pipe(
        filter((key) => key === 'Escape'),
        rxjsSpy.operators.tag('inputHandler.escape'),
        mapTo(void 0)
      )
      .subscribe(this.escape$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'Home'),
        rxjsSpy.operators.tag('inputHandler.snapToPlayer'),
        mapTo(void 0)
      )
      .subscribe(this.snapToPlayer$);

    this.keyInput$
      .pipe(
        filter((key) => key === '+'),
        rxjsSpy.operators.tag('inputHandler.zoomIn'),
        mapTo(void 0)
      )
      .subscribe(this.zoomIn$);

    this.keyInput$
      .pipe(
        filter((key) => key === '-'),
        rxjsSpy.operators.tag('inputHandler.zoomOut'),
        mapTo(void 0)
      )
      .subscribe(this.zoomOut$);
  }
}
