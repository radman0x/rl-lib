import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { PointXY, Renderer } from '@rad/rad-pixi';
import * as deepEqual from 'fast-deep-equal';
import { GridPos } from 'libs/rl-ecs/src/lib/components/position.model';
import { Renderable } from 'libs/rl-ecs/src/lib/components/renderable.model';
import * as PIXI from 'pixi.js-legacy';
import { Entity, EntityManager } from 'rad-ecs';
import { ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

export interface RendererSettings {
  tileSize: number;
  displayWidthInTiles: number;
}

@Component({
  selector: 'rad-grid-renderer',
  templateUrl: './grid-renderer.component.html',
  styleUrls: ['./grid-renderer.component.css']
})
export class GridRendererComponent implements OnInit {
  @ViewChild('render', { static: false }) renderElem: ElementRef;
  @Input('em') em: EntityManager;
  @Input('settings') settings: RendererSettings;
  @Input('sprites') spriteSheet: string;
  @Output('mouseOverGridPos') mouseOverGridPos$: Subject<PointXY>;
  @Output('mousePressGridPos') mousePressGridPos$: Subject<PointXY>;

  private sprites = new Map<number, PIXI.Sprite>();
  private desiredDisplayWidthPx: number;

  public maxTileY: number;
  public maxTileX: number;

  private rendererSubject = new ReplaySubject<Renderer>();
  private renderer: Renderer;

  constructor() {
    this.mouseOverGridPos$ = new Subject<PointXY>();
    this.mousePressGridPos$ = new Subject<PointXY>();
  }

  ngOnInit() {
    this.desiredDisplayWidthPx =
      this.settings.tileSize * this.settings.displayWidthInTiles;
  }

  ngAfterViewInit(): void {
    Renderer.create(this.spriteSheet, {
      backgroundColor: Number('0x00FFFF'),
      resizeTo: this.renderElem.nativeElement
    }).subscribe((r: Renderer) => {
      r.resize();
      (this.renderElem.nativeElement as HTMLElement).appendChild(r.view);
      this.rendererSubject.next(r);
      r.pixiApp.ticker.add(() => this.renderUpdate());

      r.mouseOver$
        .pipe(
          map(pos => this.convertToGridPos(pos)),
          filter(pos => pos !== null),
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
          map(pos => this.convertToGridPos(pos)),
          filter(pos => pos !== null)
        )
        .subscribe(this.mousePressGridPos$);

      this.renderer = r;
    });
  }

  renderUpdate(): void {
    this.renderer.pixiApp.stage = new PIXI.Container();

    const stage = this.renderer.pixiApp.stage;
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
        sprite = this.renderer.sprite(r.image);
        this.sprites.set(e.id, sprite);
      }

      sprite.position.set(p.x * TILE_SIZE, this.maxTileY - p.y * TILE_SIZE);
      stage.addChild(sprite);
    }

    stage.scale.set(
      this.renderer.pixiApp.renderer.width / this.desiredDisplayWidthPx
    );
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

  get tileSize() {
    return this.settings.tileSize;
  }
}
