
// Angular core modules
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Third-party libraries
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Application-specific imports
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { StoreTransactionHistoryComponent } from './store-transaction-history.component';

const routes: Routes = [
  {
    path: '',
    component: StoreTransactionHistoryComponent
  }
];

@NgModule({
  declarations: [StoreTransactionHistoryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatIconModule,
    MatRippleModule,
    CustomUISharedModule,
    ScrollingModule,
    TranslateModule.forChild()
  ]
})
export class StoreTransactionHistoryModule { }
