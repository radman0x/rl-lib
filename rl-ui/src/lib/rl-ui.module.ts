import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelModule } from 'primeng/panel';

import { GridRendererComponent } from './grid-renderer/grid-renderer.component';
import { StatsDisplayComponent } from './stats-display/stats-display.component';

@NgModule({
  imports: [CommonModule, PanelModule],
  declarations: [GridRendererComponent, StatsDisplayComponent],
  exports: [GridRendererComponent, StatsDisplayComponent]
})
export class RlUiModule {}
