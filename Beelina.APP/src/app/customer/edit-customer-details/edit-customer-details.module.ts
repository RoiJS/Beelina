import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EditCustomerDetailsComponent } from './edit-customer-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: EditCustomerDetailsComponent,
        title: 'EDIT_CUSTOMER_DETAILS_PAGE.TITLE',
      },
    ]),
  ],
  declarations: [EditCustomerDetailsComponent],
})
export class EditCustomerModule {}
