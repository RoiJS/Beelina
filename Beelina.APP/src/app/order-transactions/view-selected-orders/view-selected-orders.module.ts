import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';

import { ViewSelectedOrdersComponent } from './view-selected-orders.component';

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatListModule,
    ScrollingModule,
    TranslateModule.forChild(),
  ],
  declarations: [ViewSelectedOrdersComponent],
  exports: [ViewSelectedOrdersComponent]
})
export class ViewSelectedOrdersModule { }
