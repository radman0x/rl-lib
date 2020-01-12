import * as PIXI from 'pixi.js-legacy';
import { Entity, EntityManager } from 'rad-ecs';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { GridPos } from 'libs/rl-ecs/src/lib/components/position.model';
import { Renderable } from 'libs/rl-ecs/src/lib/components/renderable.model';

export interface RendererSettings {
  tileSize: number;
  displayWidthInTiles: number;
}

export class Renderer {
  get tileSize() {
    return this.settings.tileSize;
  }

  private constructor(
    private em: EntityManager,
    private settings: RendererSettings,
    options: object
  ) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.pixiApp = new PIXI.Application(options);
    this.desiredDisplayWidthPx =
      settings.tileSize * settings.displayWidthInTiles;

    this.pixiApp.renderer.plugins.interaction.on('pointermove', event => {
      if (this.pixiApp.stage) {
        this.mouseOverGridPos.next(
          this.convertToGridPos(event.data.getLocalPosition(this.pixiApp.stage))
        );
      }
    });

    this.pixiApp.renderer.plugins.interaction.on('pointerdown', event => {
      if (this.pixiApp.stage) {
        this.mousePressGridPos.next(
          this.convertToGridPos(event.data.getLocalPosition(this.pixiApp.stage))
        );
      }
    });
  }

  get view() {
    return this.pixiApp.view;
  }

  get mouseOver$() {
    return this.mouseOverGridPos.pipe(
      distinctUntilChanged((lhs, rhs) => {
        if (lhs === rhs) {
          return true;
        } else if (!lhs || !rhs) {
          return false;
        } else {
          return lhs.x === rhs.x && lhs.y === rhs.y;
        }
      })
    );
  }

  get mousePress$() {
    return this.mousePressGridPos;
  }

  public pixiApp: PIXI.Application;
  private sprites = new Map<number, PIXI.Sprite>();
  private resources: PIXI.LoaderResource;
  private desiredDisplayWidthPx: number;

  public maxTileY: number;
  public maxTileX: number;

  private mouseOverGridPos = new Subject<{ x: number; y: number } | null>();
  private mousePressGridPos = new Subject<{ x: number; y: number } | null>();
  static create(
    em: EntityManager,
    sheet: string,
    settings: RendererSettings,
    pixiAppOptions: object
  ): Observable<Renderer> {
    const subject = new Subject<Renderer>();
    const renderer = new Renderer(em, settings, pixiAppOptions);
    renderer.pixiApp.loader.add(sheet).load(() => {
      renderer.resources = renderer.pixiApp.loader.resources[sheet];
      renderer.pixiApp.ticker.add(() => renderer.renderUpdate());
      subject.next(renderer);
    });
    return subject.pipe(take(1));
  }

  renderUpdate(): void {
    this.pixiApp.stage = new PIXI.Container();

    const stage = this.pixiApp.stage;
    const TILE_SIZE = this.settings.tileSize;

    const renderableEntities: Entity[] = [];

    this.maxTileY = -1;
    this.maxTileX = -1;
    this.em.each(
      (e, r, p) => {
        if (!r.uiElem) {
          this.maxTileY = Math.max(this.maxTileY, p.y * TILE_SIZE);
          this.maxTileX = Math.max(this.maxTileX, p.x * TILE_SIZE);
        }
        renderableEntities.push(e);
      },
      Renderable,
      GridPos
    );

    const zValueCalc = (e: Entity) =>
      e.component(GridPos).z * 100 + e.component(Renderable).zOrder;
    renderableEntities.sort((lhs, rhs) => zValueCalc(lhs) - zValueCalc(rhs));

    for (const e of renderableEntities) {
      const r = e.component(Renderable);
      const p = e.component(GridPos);

      let sprite = this.sprites.get(e.id)!;
      if (!sprite) {
        sprite = new PIXI.Sprite(this.resources.textures![r.image]);
        this.sprites.set(e.id, sprite);
      }

      sprite.position.set(p.x * TILE_SIZE, this.maxTileY - p.y * TILE_SIZE);
      stage.addChild(sprite);
    }

    stage.scale.set(this.pixiApp.renderer.width / this.desiredDisplayWidthPx);
  }

  resize(): void {
    this.pixiApp.resize();
  }

  private convertToGridPos(pos: {
    x: number;
    y: number;
  }): { x: number; y: number } | null {
    if (this.maxTileX === undefined || this.maxTileY === undefined) {
      return null;
    }
    if (
      pos.x > this.maxTileX + this.tileSize ||
      pos.y > this.maxTileY + this.tileSize
    ) {
      return null;
    }
    const tileX = Math.floor(pos.x / this.tileSize);
    const tileY = Math.floor(
      (this.maxTileY + this.tileSize - pos.y) / this.tileSize
    );
    return { x: tileX, y: tileY };
  }
}
