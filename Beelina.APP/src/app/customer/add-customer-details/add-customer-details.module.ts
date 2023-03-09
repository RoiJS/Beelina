import { NgModule } from '@angular/core';
import { AddCustomerDetailsComponent } from './add-customer-details.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddCustomerDetailsComponent,
        title: 'ADD_CUSTOMER_DETAILS_PAGE.TITLE'
      }
    ])
  ],
  declarations: [AddCustomerDetailsComponent]
})
export class AddCustomerDetailsModule { }
