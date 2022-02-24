import { CompassDirection, DIR_FROM_KEY_VI } from '@rad/rl-utils';
import { Subject } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';

import * as rxjsSpy from 'rxjs-spy';

export class InputHandler {
  public keyInput$ = new Subject<string>();

  public move$ = new Subject<CompassDirection>();
  public climb$ = new Subject<void>();
  public rest$ = new Subject<void>();
  public applyItem$ = new Subject<void>();
  public useAbility$ = new Subject<void>();
  public collect$ = new Subject<void>();
  public escape$ = new Subject<void>();

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
        rxjsSpy.operators.tag('inputHandler.apply'),
        mapTo(void 0)
      )
      .subscribe(this.applyItem$);

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
  }
}
