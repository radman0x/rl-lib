import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { Renderer } from '@rad/rad-pixi';
import { EntityManager } from 'rad-ecs';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'rad-grid-renderer',
  templateUrl: './grid-renderer.component.html',
  styleUrls: ['./grid-renderer.component.css']
})
export class GridRendererComponent implements OnInit {
  @ViewChild('render', { static: false }) renderElem: ElementRef;
  @Input('em') em: EntityManager;

  private rendererSubject = new ReplaySubject<Renderer>();

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    Renderer.create(
      this.em,
      'assets/assets.json',
      { tileSize: 16, displayWidthInTiles: 20 },
      {
        backgroundColor: Number('0x00FFFF'),
        resizeTo: this.renderElem.nativeElement
      }
    ).subscribe((r: Renderer) => {
      r.resize();
      (this.renderElem.nativeElement as HTMLElement).appendChild(r.view);
      this.rendererSubject.next(r);
    });
  }
}
