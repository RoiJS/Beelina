import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { AddCustomerDetailsComponent } from './add-customer-details.component';
@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddCustomerDetailsComponent,
        title: 'ADD_CUSTOMER_DETAILS_PAGE.TITLE',
      },
    ]),
    TranslateModule.forChild(),
  ],
  declarations: [AddCustomerDetailsComponent],
})
export class AddCustomerDetailsModule {}
