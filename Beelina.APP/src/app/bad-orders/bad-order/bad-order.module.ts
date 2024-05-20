import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { BadOrderComponent } from './bad-order.component';

@NgModule({
  imports: [
    CustomUISharedModule,
    MatIconModule,
    MatRippleModule,
    MatCheckboxModule,
    MatMenuModule,
    ScrollingModule,
    MatBottomSheetModule,
    RouterModule.forChild([
      {
        path: '',
        component: BadOrderComponent,
        title: 'BAD_ORDERS_PAGE.TITLE',
      },
      {
        path: ':id',
        loadChildren: () =>
          import('./bad-order-details/bad-order-details.module').then(
            (m) => m.BadOrderDetailsModule
          ),
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [BadOrderComponent],
})
export class BadOrderModule { }
