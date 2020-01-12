import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridRendererComponent } from './grid-renderer/grid-renderer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [GridRendererComponent],
  exports: [GridRendererComponent]
})
export class RlUiModule {}
