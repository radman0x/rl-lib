import * as PIXI from 'pixi.js-legacy';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface RendererSettings {
  tileSize: number;
  displayWidthInTiles: number;
}

export interface PointXY {
  x: number;
  y: number;
}

export class Renderer {
  public pixiApp: PIXI.Application;
  private resources: PIXI.LoaderResource;

  public readonly mouseOver$ = new Subject<PointXY | null>();
  public readonly mousePress$ = new Subject<PointXY | null>();

  private constructor(options: object) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.pixiApp = new PIXI.Application(options);

    this.pixiApp.renderer.plugins.interaction.on('pointermove', event => {
      if (this.pixiApp.stage) {
        this.mouseOver$.next(event.data.getLocalPosition(this.pixiApp.stage));
      }
    });
    this.pixiApp.renderer.plugins.interaction.on('pointerdown', event => {
      if (this.pixiApp.stage) {
        this.mousePress$.next(event.data.getLocalPosition(this.pixiApp.stage));
      }
    });
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
}
