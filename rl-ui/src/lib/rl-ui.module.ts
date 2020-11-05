import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelModule } from 'primeng/panel';

import { GridRendererComponent } from './grid-renderer/grid-renderer.component';
import { StatsDisplayComponent } from './stats-display/stats-display.component';
import { MessageLogComponent } from './message-log/message-log.component';
import { PanelMenuModule } from 'primeng/panelmenu';
import { InventoryDisplayComponent } from './inventory-display/inventory-display.component';
import { AbilitiesDisplayComponent } from './abilities-display/abilities-display.component';

export { MessageLogComponent } from './message-log/message-log.component';
export { InventoryDisplayComponent } from './inventory-display/inventory-display.component';

@NgModule({
  imports: [CommonModule, PanelModule, PanelMenuModule],
  declarations: [
    GridRendererComponent,
    StatsDisplayComponent,
    MessageLogComponent,
    InventoryDisplayComponent,
    AbilitiesDisplayComponent,
  ],
  exports: [
    GridRendererComponent,
    StatsDisplayComponent,
    MessageLogComponent,
    InventoryDisplayComponent,
    AbilitiesDisplayComponent,
  ],
})
export class RlUiModule {}
