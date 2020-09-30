import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelModule } from 'primeng/panel';

import { GridRendererComponent } from './grid-renderer/grid-renderer.component';
import { StatsDisplayComponent } from './stats-display/stats-display.component';
import { MessageLogComponent } from './message-log/message-log.component';

export { MessageLogComponent } from './message-log/message-log.component';

@NgModule({
  imports: [CommonModule, PanelModule],
  declarations: [
    GridRendererComponent,
    StatsDisplayComponent,
    MessageLogComponent,
  ],
  exports: [GridRendererComponent, StatsDisplayComponent, MessageLogComponent],
})
export class RlUiModule {}
