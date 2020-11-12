import { CompassDirection, DIR_FROM_KEY_VI } from '@rad/rl-utils';
import { Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import * as rxjsSpy from 'rxjs-spy';

export class InputHandler {
  public keyInput$ = new Subject<string>();

  public move$ = new Subject<CompassDirection>();
  public climb$ = new Subject();
  public rest$ = new Subject();
  public applyItem$ = new Subject();
  public useAbility$ = new Subject();
  public collect$ = new Subject();
  public escape$ = new Subject();

  constructor() {
    this.keyInput$
      .pipe(
        filter((key) => key === '.' || key === '5'),
        rxjsSpy.operators.tag('inputHandler.rest'),
        tap((key) => console.log(`Resting: ${key}`))
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
        tap((key) => console.log(`Climb key: ${key}`))
      )
      .subscribe(this.climb$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'a'),
        rxjsSpy.operators.tag('inputHandler.apply')
      )
      .subscribe(this.applyItem$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'A'),
        rxjsSpy.operators.tag('inputHandler.ability')
      )
      .subscribe(this.useAbility$);

    this.keyInput$
      .pipe(
        filter((key) => key === ','),
        rxjsSpy.operators.tag('inputHandler.collect')
      )
      .subscribe(this.collect$);
    this.keyInput$
      .pipe(
        filter((key) => key === 'Escape'),
        rxjsSpy.operators.tag('inputHandler.escape')
      )
      .subscribe(this.escape$);
  }
}
