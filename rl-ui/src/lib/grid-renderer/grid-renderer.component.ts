import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PointXY, Renderer } from '@rad/rad-pixi';
import { AlwaysRendered, Knowledge, KnowledgeMap, StatusEffects } from '@rad/rl-ecs';
import { rotColorToNumber } from '@rad/rl-utils';
import * as deepEqual from 'fast-deep-equal';
import { LightLevel } from 'libs/rl-ecs/src/lib/components/light-level.model';
import { GridPos } from 'libs/rl-ecs/src/lib/components/position.model';
import { Renderable } from 'libs/rl-ecs/src/lib/components/renderable.model';
import * as PIXI from 'pixi.js-legacy';
import { Entity, EntityId, EntityManager } from 'rad-ecs';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

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
  private overlaySprites = new Map<number, PIXI.Sprite>();
  private animations = new Map<number, PIXI.AnimatedSprite>();
  private overlaySpriteCounter = 1;
  private animationCounter = 1;
  private desiredDisplayWidthPx: number;
  private desiredDisplayHeightPx: number;

  public maxTileY: number;
  public maxTileX: number;

  private rendererSubject = new ReplaySubject<Renderer>();
  private renderer: Renderer;

  private haltRender = false;

  constructor() {
    this.mouseOverGridPos$ = new Subject<PointXY>();
    this.mousePressGridPos$ = new Subject<PointXY>();
  }

  ngOnInit() {
    if (!this.em) {
      throw Error(`No entity manager provided to grid renderer`);
    }
    this.desiredDisplayWidthPx = this.settings.tileSize * this.settings.displayWidthInTiles;
    this.desiredDisplayHeightPx = this.settings.tileSize * this.settings.displayHeightInTiles;
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

  playAnimation(name: string, pos: PointXY, speed: number, scale?: number): Observable<void> {
    const anim = this.renderer.animatedSprite(name, speed);
    const animId = this.animationCounter++;
    this.animations.set(animId, anim);
    anim.play();
    anim.scale.set(scale || 1);
    anim.loop = false;
    anim.position.set(
      pos.x * this.settings.tileSize,
      this.maxTileY - pos.y * this.settings.tileSize
    );
    const completion = new Subject<void>();
    anim.onComplete = () => {
      this.haltRender = false;
      completion.next();
      completion.complete();
    };
    completion.subscribe(() => {
      this.animations.get(animId).destroy();
      this.animations.delete(animId);
    });
    // this.renderer.pixiApp.stage.addChild(anim);
    // this.haltRender = true;
    return completion;
  }

  addSprite(name: string, pos: PointXY) {
    const sprite = this.renderer.sprite(name);
    const id = this.overlaySpriteCounter++;
    this.overlaySprites.set(id, sprite);
    sprite.position.set(
      pos.x * this.settings.tileSize,
      this.maxTileY - pos.y * this.settings.tileSize
    );
    return id;
  }

  removeSprite(id: number) {
    this.overlaySprites.get(id).destroy();
    this.overlaySprites.delete(id);
  }

  reset(): void {
    for (const [, sprite] of this.sprites) {
      sprite.destroy();
    }
    this.sprites = new Map<number, PIXI.Sprite>();
  }

  renderUpdate(): void {
    if (this.haltRender) {
      return;
    }
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

      this.renderFromKnowledge(historicalKnowledge, viewerZPos, stage, 0xaaaaaa);
      this.renderFromKnowledge(currentKnowledge, viewerZPos, stage, 0x000000);

      this.em.each(
        (e, ar, r, pos) => {
          this.renderEntity(e.id, stage, 0x000000, pos);
        },
        AlwaysRendered,
        Renderable,
        GridPos
      );

      for (let [, anim] of this.animations) {
        stage.addChild(anim);
      }

      for (let [, sprite] of this.overlaySprites) {
        stage.addChild(sprite);
      }

      const widthLimit = this.renderer.pixiApp.renderer.width / this.desiredDisplayWidthPx;
      const heightLimit = this.renderer.pixiApp.renderer.height / this.desiredDisplayHeightPx;
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
    if (pos.x > this.maxTileX + this.tileSize || pos.y > this.maxTileY + this.tileSize) {
      return null;
    }
    const tileX = Math.floor(pos.x / this.tileSize);
    const tileY = Math.floor((this.maxTileY + this.tileSize - pos.y) / this.tileSize);
    return { x: tileX, y: tileY };
  }

  private renderFromKnowledge(
    knowledge: KnowledgeMap,
    viewerZPos: number,
    stage: PIXI.Container,
    tintModifier: number
  ) {
    const zValueCalc = (e: Entity) => e.component(Renderable).zOrder;
    const zSortedHistoricalKnowledgePositions = Array.from(knowledge.values())
      .filter(({ k: pos }) => pos.z >= viewerZPos - 1 && pos.z <= viewerZPos)
      .sort((lhs, rhs) => lhs.k.z - rhs.k.z);

    for (const { k: seenPos, v: ids } of zSortedHistoricalKnowledgePositions) {
      const posRawLight = this.em
        .matchingIndex(seenPos)
        .find((e) => e.has(LightLevel))
        ?.component(LightLevel).raw;
      const finalTint = posRawLight
        ? Math.max(rotColorToNumber(posRawLight) - tintModifier, 0x444444)
        : 0xffffff;
      const sortedIds = [...ids]
        .filter((id) => this.em.exists(id) && this.em.getComponent(id, Renderable) !== undefined)
        .sort((lhs, rhs) => {
          return zValueCalc(this.em.get(lhs)) - zValueCalc(this.em.get(rhs));
        });
      for (const seenEntityId of sortedIds) {
        this.renderEntity(seenEntityId, stage, finalTint, seenPos);
      }
    }
  }

  private renderEntity(id: EntityId, stage: PIXI.Container, tint: number, pos: GridPos) {
    let sprite = this.sprites.get(id);
    const renderable = this.em.getComponent(id, Renderable);
    // const renderable: Renderable | AlternateRenderable =
    //   lightLevel >= LightLevels.DARK
    //     ? this.em.getComponent(id, Renderable)
    //     : this.em.getComponent(id, AlternateRenderable);
    if (renderable) {
      const r = renderable;
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
      if (sprite) {
        sprite.visible = false;
      }
    }

    if (this.em.hasComponent(id, StatusEffects)) {
      for (let statusEffectId of this.em.getComponent(id, StatusEffects).contents) {
        this.renderEntity(statusEffectId, stage, tint, pos);
      }
    }
  }
}
