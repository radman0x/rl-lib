import * as PIXI from 'pixi.js-legacy';
import { Observable, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface RendererSettings {
  tileSize: number;
  displayWidthInTiles: number;
}

export class Renderer {
  public pixiApp: PIXI.Application;
  private resources: PIXI.LoaderResource;

  private constructor(options: object) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.pixiApp = new PIXI.Application(options);
  }

  static create(sheet: string, pixiAppOptions: object): Observable<Renderer> {
    const subject = new ReplaySubject<Renderer>();
    const renderer = new Renderer(pixiAppOptions);
    renderer.pixiApp.loader.add(sheet).load((loader, resources) => {
      const errors: string[] = [];
      for (const res of Object.values(resources)) {
        if (res.error) {
          errors.push(`Failed to load: ${res.url}, because: ${res.error}`);
        }
      }
      if (errors.length !== 0) {
        throw Error(`\n${errors.join(`\n`)}`);
      }
      renderer.resources = renderer.pixiApp.loader.resources[sheet];
      subject.next(renderer);
    });
    return subject.pipe(take(1));
  }

  sprite(name: string): PIXI.Sprite {
    if (name === '') {
      throw Error(`Sprite name must not be an empty string`);
    }
    return new PIXI.Sprite(this.resources.textures![name]);
  }

  resize(): void {
    this.pixiApp.resize();
  }

  get view() {
    return this.pixiApp.view;
  }

  // get mouseOver$() {
  //   return this.mouseOverGridPos.pipe(
  //     distinctUntilChanged((lhs, rhs) => {
  //       if (lhs === rhs) {
  //         return true;
  //       } else if (!lhs || !rhs) {
  //         return false;
  //       } else {
  //         return lhs.x === rhs.x && lhs.y === rhs.y;
  //       }
  //     })
  //   );
  // }

  // get mousePress$() {
  //   return this.mousePressGridPos;
  // }

  // private mouseOverGridPos = new Subject<{ x: number; y: number } | null>();
  // private mousePressGridPos = new Subject<{ x: number; y: number } | null>();
}
