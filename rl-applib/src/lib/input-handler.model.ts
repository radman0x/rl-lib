import { CompassDirection, DIR_FROM_KEY_VI } from '@rad/rl-utils';
import { Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

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
        tap((key) => console.log(`Resting: ${key}`))
      )
      .subscribe(this.rest$);

    this.keyInput$
      .pipe(
        filter((key) => DIR_FROM_KEY_VI.has(key)),
        tap((key) => console.log(`Move key: ${key}`)),
        map((key) => DIR_FROM_KEY_VI.get(key)!)
      )
      .subscribe(this.move$);

    this.keyInput$
      .pipe(
        filter((key) => key === '<' || key === '>'),
        tap((key) => console.log(`Climb key: ${key}`))
      )
      .subscribe(this.climb$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'a'),
        tap((key) => console.log(`Apply key: ${key}`))
      )
      .subscribe(this.applyItem$);

    this.keyInput$
      .pipe(
        filter((key) => key === 'A'),
        tap((key) => console.log(`Use ability key: ${key}`))
      )
      .subscribe(this.useAbility$);

    this.keyInput$
      .pipe(
        filter((key) => key === ','),
        tap((key) => console.log(`Collect key: ${key}`))
      )
      .subscribe(this.collect$);
    this.keyInput$
      .pipe(
        filter((key) => key === 'Escape'),
        tap((key) => console.log(`Escape key: ${key}`))
      )
      .subscribe(this.escape$);
  }
}
