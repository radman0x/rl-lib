import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelModule } from 'primeng/panel';

import { GridRendererComponent } from './grid-renderer/grid-renderer.component';
import { StatsDisplayComponent } from './stats-display/stats-display.component';
import { MessageLogComponent } from './message-log/message-log.component';
import { PanelMenuModule } from 'primeng/panelmenu';
import { InventoryDisplayComponent } from './inventory-display/inventory-display.component';

export { MessageLogComponent } from './message-log/message-log.component';
export { InventoryDisplayComponent } from './inventory-display/inventory-display.component';

@NgModule({
  imports: [CommonModule, PanelModule, PanelMenuModule],
  declarations: [
    GridRendererComponent,
    StatsDisplayComponent,
    MessageLogComponent,
    InventoryDisplayComponent,
  ],
  exports: [
    GridRendererComponent,
    StatsDisplayComponent,
    MessageLogComponent,
    InventoryDisplayComponent,
  ],
})
export class RlUiModule {}
