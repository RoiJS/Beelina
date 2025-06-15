import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { OrderTransactionsComponent } from './order-transactions.component';

@NgModule({
  imports: [
    CustomUISharedModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    RouterModule.forChild([
      {
        path: '',
        component: OrderTransactionsComponent
      }
    ]),
    ReactiveFormsModule,
    TranslateModule.forChild()
  ],
  declarations: [OrderTransactionsComponent]
})
export class OrderTransactionsModule { }
