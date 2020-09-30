import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { PointXY, Renderer } from '@rad/rad-pixi';
import * as deepEqual from 'fast-deep-equal';
import { GridPos } from 'libs/rl-ecs/src/lib/components/position.model';
import { Renderable } from 'libs/rl-ecs/src/lib/components/renderable.model';
import * as PIXI from 'pixi.js-legacy';
import { Entity, EntityManager, EntityId } from 'rad-ecs';
import { ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { KnowledgeMap, Knowledge } from '@rad/rl-ecs';

export interface RendererSettings {
  tileSize: number;
  displayWidthInTiles: number;
  displayHeightInTiles: number;
}

@Component({
  selector: 'rad-grid-renderer',
  templateUrl: './grid-renderer.component.html',
  styleUrls: ['./grid-renderer.component.css'],
})
export class GridRendererComponent implements OnInit {
  @ViewChild('render', { static: false }) renderElem: ElementRef;
  @Input('em') em: EntityManager;
  @Input('settings') settings: RendererSettings;
  @Input('sprites') spriteSheet: string;
  @Input('viewerId') viewerId: EntityId;
  @Input('backgroundColor') backgroundColor: number;
  @Output('mouseOverGridPos') mouseOverGridPos$: Subject<PointXY>;
  @Output('mousePressGridPos') mousePressGridPos$: Subject<PointXY>;

  private sprites = new Map<number, PIXI.Sprite>();
  private desiredDisplayWidthPx: number;
  private desiredDisplayHeightPx: number;

  public maxTileY: number;
  public maxTileX: number;

  private rendererSubject = new ReplaySubject<Renderer>();
  private renderer: Renderer;

  constructor() {
    this.mouseOverGridPos$ = new Subject<PointXY>();
    this.mousePressGridPos$ = new Subject<PointXY>();
  }

  ngOnInit() {
    if (!this.em) {
      throw Error(`No entity manager provided to grid renderer`);
    }
    this.desiredDisplayWidthPx =
      this.settings.tileSize * this.settings.displayWidthInTiles;
    this.desiredDisplayHeightPx =
      this.settings.tileSize * this.settings.displayHeightInTiles;
  }

  ngAfterViewInit(): void {
    Renderer.create(this.spriteSheet, {
      backgroundColor: Number(this.backgroundColor),
      resizeTo: this.renderElem.nativeElement,
    }).subscribe((r: Renderer) => {
      r.resize();
      (this.renderElem.nativeElement as HTMLElement).appendChild(r.view);
      this.rendererSubject.next(r);
      r.pixiApp.ticker.add(() => this.renderUpdate());

      r.mouseOver$
        .pipe(
          map((pos) => this.convertToGridPos(pos)),
          filter((pos) => pos !== null),
          distinctUntilChanged((lhs, rhs) => {
            if (!lhs || !rhs) {
              return false;
            } else {
              return deepEqual(rhs, lhs);
            }
          })
        )
        .subscribe(this.mouseOverGridPos$);

      r.mousePress$
        .pipe(
          map((pos) => this.convertToGridPos(pos)),
          filter((pos) => pos !== null)
        )
        .subscribe(this.mousePressGridPos$);

      this.renderer = r;
    });
  }

  reset(): void {
    for (const [, sprite] of this.sprites) {
      sprite.destroy();
    }
    this.sprites = new Map<number, PIXI.Sprite>();
  }

  renderUpdate(): void {
    this.renderer.pixiApp.stage = new PIXI.Container();

    const stage = this.renderer.pixiApp.stage;
    const TILE_SIZE = this.settings.tileSize;

    // radNOTE:
    // This is dynamic calculation of the dimensions of the world rendering based off what's in the ECS. This could be
    // useful where level sizes vary and you want the render area to dynamically expand to fit. However with the advent
    // of multiple levels and not currently clearing existing it works off anything that existed ever. I've swapped to
    // a static config specfication but I can see that the dynamic calculation could be useful when I want to make the
    // render control more sophisticated.
    //
    // this.maxTileY = -1;
    // this.maxTileX = -1;
    // this.em.each(
    //   (e, r, p) => {
    //     if (!r.uiElem) {
    //       this.maxTileY = Math.max(this.maxTileY, p.y * TILE_SIZE);
    //       this.maxTileX = Math.max(this.maxTileX, p.x * TILE_SIZE);
    //     }
    //   },
    //   Renderable,
    //   GridPos
    // );
    // this.maxTileX += 1 * TILE_SIZE;
    // this.maxTileY += 1 * TILE_SIZE;

    this.maxTileX = this.desiredDisplayWidthPx - TILE_SIZE;
    this.maxTileY = this.desiredDisplayHeightPx - TILE_SIZE;

    if (this.viewerId !== undefined && this.em.exists(this.viewerId)) {
      const viewerZPos = this.em.getComponent(this.viewerId, GridPos).z;
      const viewerKnowledge = this.em.getComponent(this.viewerId, Knowledge);
      const currentKnowledge = viewerKnowledge.current;
      const historicalKnowledge = viewerKnowledge.history;

      // radNOTE: Replaced this with the below, only making not visible had the sprites appearing somewhat randomly about the place after transitioning levels :P
      // for (const [, sprite] of this.sprites) {
      //   sprite.visible = false;
      // }
      for (const [, sprite] of this.sprites) {
        sprite.destroy();
      }
      this.sprites.clear();

      this.renderFromKnowledge(
        historicalKnowledge,
        viewerZPos,
        stage,
        0x999999
      );
      this.renderFromKnowledge(currentKnowledge, viewerZPos, stage, 0xffffff);
      const widthLimit =
        this.renderer.pixiApp.renderer.width / this.desiredDisplayWidthPx;
      const heightLimit =
        this.renderer.pixiApp.renderer.height / this.desiredDisplayHeightPx;
      stage.scale.set(Math.min(widthLimit, heightLimit));
    }
  }

  get tileSize() {
    return this.settings.tileSize;
  }

  private convertToGridPos(pos: PointXY): PointXY | null {
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

  private renderFromKnowledge(
    knowledge: KnowledgeMap,
    viewerZPos: number,
    stage: PIXI.Container,
    tint: number
  ) {
    const zValueCalc = (e: Entity) => e.component(Renderable).zOrder;
    const zSortedHistoricalKnowledgePositions = Array.from(knowledge.values())
      .filter(({ k: pos }) => pos.z >= viewerZPos - 1 && pos.z <= viewerZPos)
      .sort((lhs, rhs) => lhs.k.z - rhs.k.z);

    for (const { k: seenPos, v: ids } of zSortedHistoricalKnowledgePositions) {
      const sortedIds = [...ids]
        .filter(
          (id) =>
            this.em.exists(id) &&
            this.em.getComponent(id, Renderable) !== undefined
        )
        .sort((lhs, rhs) => {
          return zValueCalc(this.em.get(lhs)) - zValueCalc(this.em.get(rhs));
        });
      for (const seenEntityId of sortedIds) {
        this.renderEntity(seenEntityId, stage, tint, seenPos);
      }
    }
  }

  private renderEntity(
    id: EntityId,
    stage: PIXI.Container,
    tint: number,
    pos: GridPos
  ) {
    if (
      this.em.hasComponent(id, Renderable) &&
      this.em.hasComponent(id, GridPos)
    ) {
      const r = this.em.getComponent(id, Renderable);
      let sprite = this.sprites.get(id);
      if (!sprite) {
        sprite = this.renderer.sprite(r.image);
        this.sprites.set(id, sprite);
      }

      sprite.tint = tint;
      sprite.visible = true;

      sprite.position.set(
        pos.x * this.settings.tileSize,
        this.maxTileY - pos.y * this.settings.tileSize
      );
      stage.addChild(sprite);
    } else {
      let sprite = this.sprites.get(id);
      if (sprite) {
        sprite.visible = false;
      }
    }
  }
}
